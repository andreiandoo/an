<?php
// Primește formularele de pe site și le trimite pe email.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const TO = 'salut@andreinastase.ro';
// Expeditorul trebuie să fie o căsuță reală pe domeniu, altfel serverul refuză mesajul.
const FROM = 'site@andreinastase.ro';
const MAX_PER_HOUR = 8;
const MAX_FIELD = 4000;
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
    $step = function (?string $cmd, string $expect) use ($s): bool {
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
            error_log('contact.php smtp ' . ($cmd === null ? 'greeting' : strtok($cmd, ' :')) . ': ' . trim($res));
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
    $ok = $step(null, '220')
        && $step('EHLO andreinastase.ro', '250')
        && $step('AUTH LOGIN', '334')
        && $step(base64_encode($c['user']), '334')
        && $step(base64_encode($c['pass']), '235')
        && $step('MAIL FROM:<' . FROM . '>', '250')
        && $step("RCPT TO:<$to>", '250')
        && $step('DATA', '354')
        && $step($data . "\r\n.", '250');
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

$subject = clean_line((string) ($_POST['subiect'] ?? 'Mesaj de pe andreinastase.ro'));
$subject = '=?UTF-8?B?' . base64_encode(mb_substr($subject, 0, 120)) . '?=';
$headers = ['From: andreinastase.ro <' . FROM . '>', 'Content-Type: text/plain; charset=UTF-8'];
if ($email !== '') {
    $headers[] = "Reply-To: $email";
}

if (!send_mail(TO, $subject, implode("\n\n", $lines), $headers)) {
    reply(500, ['ok' => false]);
}

$hits[] = time();
file_put_contents($file, implode("\n", $hits), LOCK_EX);
reply(200, ['ok' => true]);
