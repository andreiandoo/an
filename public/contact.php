<?php
// Primește formularele de pe site și le trimite pe email.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const TO = 'salut@andreinastase.ro';
// Expeditorul trebuie să fie o căsuță reală pe domeniu, altfel serverul refuză mesajul.
const FROM = 'site@andreinastase.ro';
const MAX_PER_HOUR = 8;
const MAX_FIELD = 4000;
const MAX_FILES = 5;
const MAX_FILES_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];
// Opțional: login SMTP, ținut un nivel deasupra public_html ca să nu fie servit niciodată.
// Conținut: <?php return ['host' => 'mail.andreinastase.ro', 'port' => 465, 'user' => 'site@andreinastase.ro', 'pass' => '...'];
const SMTP_CONFIG = __DIR__ . '/../contact-smtp.php';

function reply(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_line(string $value): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $value));
}

// SMTP minimal, TLS direct (portul 465), AUTH LOGIN.
function smtp_send(array $c, string $to, string $subject, string $body, array $headers): bool {
    $s = @stream_socket_client("ssl://{$c['host']}:{$c['port']}", $errno, $errstr, 15);
    if (!$s) {
        error_log("contact.php smtp connect: $errno $errstr");
        return false;
    }
    stream_set_timeout($s, 15);
    $step = function (string $label, ?string $cmd, string $expect) use ($s): bool {
        if ($cmd !== null) {
            fwrite($s, $cmd . "\r\n");
        }
        $res = '';
        while (($line = fgets($s, 515)) !== false) {
            $res .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        if (strncmp($res, $expect, 3) !== 0) {
            error_log("contact.php smtp $label: " . trim($res));
            return false;
        }
        return true;
    };
    $text = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $body));
    $data = implode("\r\n", array_merge(
        ["To: $to", "Subject: $subject", 'Date: ' . date('r'), 'MIME-Version: 1.0'],
        $headers,
        ['', str_replace("\n", "\r\n", $text)]
    ));
    // Labels, not commands, go to the log, so the base64 login never ends up there.
    $ok = $step('greeting', null, '220')
        && $step('EHLO', 'EHLO andreinastase.ro', '250')
        && $step('AUTH', 'AUTH LOGIN', '334')
        && $step('user', base64_encode($c['user']), '334')
        && $step('password', base64_encode($c['pass']), '235')
        && $step('MAIL FROM', 'MAIL FROM:<' . FROM . '>', '250')
        && $step('RCPT TO', "RCPT TO:<$to>", '250')
        && $step('DATA', 'DATA', '354')
        && $step('message', $data . "\r\n.", '250');
    fwrite($s, "QUIT\r\n");
    fclose($s);
    return $ok;
}

function send_mail(string $to, string $subject, string $body, array $headers): bool {
    if (is_file(SMTP_CONFIG)) {
        return smtp_send(require SMTP_CONFIG, $to, $subject, $body, $headers);
    }
    if (mail($to, $subject, $body, implode("\r\n", $headers), '-f' . FROM)) {
        return true;
    }
    error_log('contact.php mail(): ' . (error_get_last()['message'] ?? 'returned false'));
    return false;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false]);
}

// Peste post_max_size, PHP golește $_POST și $_FILES: spunem clar că e prea mare.
if (empty($_POST) && empty($_FILES) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    reply(413, ['ok' => false]);
}

// Capcană pentru roboți: răspundem normal, dar nu trimitem nimic.
if (!empty($_POST['website'])) {
    reply(200, ['ok' => true]);
}

$ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$file = sys_get_temp_dir() . "/an-contact-$ip";
$hour = time() - 3600;
$hits = is_file($file) ? array_filter(array_map('intval', file($file, FILE_IGNORE_NEW_LINES)), fn($t) => $t > $hour) : [];
if (count($hits) >= MAX_PER_HOUR) {
    reply(429, ['ok' => false]);
}

$labels = [
    'nume' => 'Nume', 'telefon' => 'Telefon', 'firma' => 'Firma', 'email' => 'Email',
    'interes' => 'Interes', 'problema' => 'Ce vrea să rezolve', 'idee' => 'Idee', 'cine' => 'Cine are problema',
    'stadiu' => 'Stadiu', 'link' => 'Link', 'continuare' => 'Continuare',
];
$lines = [];
foreach ($labels as $key => $label) {
    $value = trim((string) ($_POST[$key] ?? ''));
    if ($value !== '') {
        $lines[] = "$label: " . mb_substr($value, 0, MAX_FIELD);
    }
}

$name = clean_line((string) ($_POST['nume'] ?? ''));
$email = clean_line((string) ($_POST['email'] ?? ''));
$phone = clean_line((string) ($_POST['telefon'] ?? ''));
if ($name === '' || ($email === '' && $phone === '') || ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    reply(422, ['ok' => false]);
}

// Atașamente (schițe, ecrane): doar imagini și PDF, cu limită de număr și mărime.
$attachments = [];
$up = $_FILES['fisiere'] ?? null;
if ($up && is_array($up['name'])) {
    $total = 0;
    $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
    foreach ($up['name'] as $i => $original) {
        $err = $up['error'][$i];
        if ($err === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            reply(413, ['ok' => false]);
        }
        if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($up['tmp_name'][$i])) {
            reply(400, ['ok' => false]);
        }
        $total += $up['size'][$i];
        if (count($attachments) >= MAX_FILES || $total > MAX_FILES_BYTES) {
            reply(413, ['ok' => false]);
        }
        $ext = strtolower(pathinfo((string) $original, PATHINFO_EXTENSION));
        $type = $finfo ? finfo_file($finfo, $up['tmp_name'][$i])
            : (['png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'gif' => 'image/gif', 'pdf' => 'application/pdf'][$ext] ?? '');
        if (!in_array($type, ALLOWED_TYPES, true)) {
            reply(415, ['ok' => false]);
        }
        $name_safe = preg_replace('/[^\p{L}\p{N}._\-() ]+/u', '_', basename((string) $original)) ?: 'fisier';
        $attachments[] = ['name' => mb_substr($name_safe, 0, 100), 'type' => $type, 'data' => file_get_contents($up['tmp_name'][$i])];
    }
    if ($attachments) {
        $lines[] = 'Fișiere atașate: ' . implode(', ', array_column($attachments, 'name'));
    }
}

$subject = clean_line((string) ($_POST['subiect'] ?? 'Mesaj de pe andreinastase.ro'));
$subject = '=?UTF-8?B?' . base64_encode(mb_substr($subject, 0, 120)) . '?=';
$headers = ['From: andreinastase.ro <' . FROM . '>'];
if ($email !== '') {
    $headers[] = "Reply-To: $email";
}

$text = implode("\n\n", $lines);
if ($attachments) {
    $boundary = 'an-' . bin2hex(random_bytes(12));
    $headers[] = "Content-Type: multipart/mixed; boundary=\"$boundary\"";
    $parts = ["--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))];
    foreach ($attachments as $a) {
        // Numele cu diacritice merg ca encoded-word (RFC 2047), forma pe care o citesc Gmail și Outlook.
        $fname = preg_match('/[^\x20-\x7e]/', $a['name']) ? '=?UTF-8?B?' . base64_encode($a['name']) . '?=' : $a['name'];
        $parts[] = "--$boundary\r\nContent-Type: {$a['type']}; name=\"$fname\"\r\nContent-Transfer-Encoding: base64\r\n"
            . "Content-Disposition: attachment; filename=\"$fname\"\r\n\r\n"
            . chunk_split(base64_encode($a['data']));
    }
    $body = implode('', $parts) . "--$boundary--\r\n";
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $body = $text;
}

if (!send_mail(TO, $subject, $body, $headers)) {
    reply(500, ['ok' => false]);
}

$hits[] = time();
file_put_contents($file, implode("\n", $hits), LOCK_EX);
reply(200, ['ok' => true]);
