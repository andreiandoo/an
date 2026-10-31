<?php
// Primește formularele de pe site și le trimite pe email.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const TO = 'contact@andreinastase.ro';
const FROM = 'site@andreinastase.ro';
const MAX_PER_HOUR = 8;
const MAX_FIELD = 4000;

function reply(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_line(string $value): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $value));
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
$headers = ['From: ' . FROM, 'Content-Type: text/plain; charset=UTF-8'];
if ($email !== '') {
    $headers[] = "Reply-To: $email";
}

if (!mail(TO, $subject, implode("\n\n", $lines), implode("\r\n", $headers))) {
    reply(500, ['ok' => false]);
}

$hits[] = time();
file_put_contents($file, implode("\n", $hits), LOCK_EX);
reply(200, ['ok' => true]);
