<?php
declare(strict_types=1);

const TIMZY_CONFIG_PATH = __DIR__ . '/../.private/timzy-contact-config.php';

function timzy_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function timzy_config(): array
{
    if (!is_file(TIMZY_CONFIG_PATH)) {
        timzy_json(['ok' => false, 'code' => 'configuration'], 503);
    }
    $config = require TIMZY_CONFIG_PATH;
    if (!is_array($config)) {
        timzy_json(['ok' => false, 'code' => 'configuration'], 503);
    }
    return $config;
}

function timzy_base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function timzy_base64url_decode(string $value): string|false
{
    $padded = str_pad(strtr($value, '-_', '+/'), (int) ceil(strlen($value) / 4) * 4, '=', STR_PAD_RIGHT);
    return base64_decode($padded, true);
}

function timzy_create_captcha(string $secret): array
{
    $a = random_int(2, 9);
    $b = random_int(1, 9);
    $data = json_encode(['a' => $a, 'b' => $b, 'exp' => (int) floor(microtime(true) * 1000) + 300000, 'nonce' => bin2hex(random_bytes(8))]);
    $encoded = timzy_base64url_encode($data);
    $signature = timzy_base64url_encode(hash_hmac('sha256', $encoded, $secret, true));
    return ['question' => "$a + $b =", 'token' => "$encoded.$signature"];
}

function timzy_verify_captcha(string $token, string $answer, string $secret): bool
{
    $parts = explode('.', $token);
    if (count($parts) !== 2 || $parts[0] === '' || $parts[1] === '') {
        return false;
    }
    [$encoded, $signature] = $parts;
    $expected = timzy_base64url_encode(hash_hmac('sha256', $encoded, $secret, true));
    if (!hash_equals($expected, $signature)) {
        return false;
    }
    $decoded = timzy_base64url_decode($encoded);
    $data = $decoded === false ? null : json_decode($decoded, true);
    if (!is_array($data) || !is_int($data['a'] ?? null) || !is_int($data['b'] ?? null) || !is_int($data['exp'] ?? null)) {
        return false;
    }
    return $data['exp'] >= (int) floor(microtime(true) * 1000) && (int) $answer === $data['a'] + $data['b'];
}

function timzy_clean(mixed $value, int $max): string
{
    return is_string($value) ? mb_substr(trim($value), 0, $max) : '';
}

function timzy_smtp_read($socket, array $expected): string
{
    $response = '';
    do {
        $line = fgets($socket, 1024);
        if ($line === false) {
            throw new RuntimeException('SMTP connection closed');
        }
        $response .= $line;
    } while (isset($line[3]) && $line[3] === '-');
    $code = (int) substr($response, 0, 3);
    if (!in_array($code, $expected, true)) {
        throw new RuntimeException("SMTP rejected command ($code)");
    }
    return $response;
}

function timzy_smtp_command($socket, string $command, array $expected): void
{
    fwrite($socket, $command . "\r\n");
    timzy_smtp_read($socket, $expected);
}

function timzy_send_contact_email(array $config, array $details): void
{
    foreach (['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_from', 'contact_to'] as $key) {
        if (!isset($config[$key]) || $config[$key] === '') {
            throw new RuntimeException('Contact mail is not configured');
        }
    }
    $host = (string) $config['smtp_host'];
    $port = (int) $config['smtp_port'];
    $context = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'peer_name' => $host]]);
    $socket = stream_socket_client("ssl://$host:$port", $errorCode, $errorMessage, 15, STREAM_CLIENT_CONNECT, $context);
    if ($socket === false) {
        throw new RuntimeException("SMTP connection failed ($errorCode)");
    }
    stream_set_timeout($socket, 15);
    try {
        timzy_smtp_read($socket, [220]);
        timzy_smtp_command($socket, 'EHLO timzy.app', [250]);
        timzy_smtp_command($socket, 'AUTH LOGIN', [334]);
        timzy_smtp_command($socket, base64_encode((string) $config['smtp_username']), [334]);
        timzy_smtp_command($socket, base64_encode((string) $config['smtp_password']), [235]);
        timzy_smtp_command($socket, 'MAIL FROM:<' . str_replace(["\r", "\n"], '', (string) $config['smtp_from']) . '>', [250]);
        timzy_smtp_command($socket, 'RCPT TO:<' . str_replace(["\r", "\n"], '', (string) $config['contact_to']) . '>', [250, 251]);
        timzy_smtp_command($socket, 'DATA', [354]);

        $subject = 'Nowe zapytanie Timzy: ' . $details['company'];
        $body = implode("\n", [
            'Nowe zapytanie z formularza na stronie Timzy', '',
            'Imię i nazwisko: ' . $details['name'],
            'Firma / marka: ' . $details['company'],
            'E-mail: ' . $details['email'],
            'Telefon: ' . ($details['phone'] ?: 'nie podano'),
            'Kraj: ' . $details['country'],
            'Liczba pracowników / trenerów: ' . $details['teamSize'],
            'Preferowany termin kontaktu: ' . ($details['contactTime'] ?: 'nie podano'),
            'Branża: ' . $details['industry'],
            'Język strony: ' . $details['locale'], '',
            'Wiadomość:', $details['message'] !== '' ? $details['message'] : 'nie podano', '',
            'Otrzymano: ' . gmdate('c'),
        ]);
        $headers = [
            'From: Timzy Formularz <' . $config['smtp_from'] . '>',
            'To: ' . $config['contact_to'],
            'Reply-To: ' . str_replace(["\r", "\n"], '', $details['email']),
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'Date: ' . gmdate('D, d M Y H:i:s') . ' GMT',
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@timzy.app>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64', '',
            chunk_split(base64_encode($body), 76, "\r\n"),
        ];
        $message = preg_replace('/^\./m', '..', implode("\r\n", $headers));
        fwrite($socket, $message . "\r\n.\r\n");
        timzy_smtp_read($socket, [250]);
        timzy_smtp_command($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}
