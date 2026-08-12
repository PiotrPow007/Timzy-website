<?php
declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    timzy_json(['ok' => false, 'code' => 'method'], 405);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$expectedOrigin = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'timzy.app');
if ($origin !== '' && !hash_equals($expectedOrigin, $origin)) {
    timzy_json(['ok' => false, 'code' => 'origin'], 403);
}
$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload)) {
    timzy_json(['ok' => false, 'code' => 'validation'], 400);
}
$name = timzy_clean($payload['name'] ?? null, 100);
$company = timzy_clean($payload['company'] ?? null, 140);
$email = strtolower(timzy_clean($payload['email'] ?? null, 180));
$phone = timzy_clean($payload['phone'] ?? null, 40);
$country = timzy_clean($payload['country'] ?? null, 80);
$teamSize = timzy_clean($payload['teamSize'] ?? null, 20);
$contactTime = timzy_clean($payload['contactTime'] ?? null, 120);
$industry = timzy_clean($payload['industry'] ?? null, 100);
$message = timzy_clean($payload['message'] ?? null, 2500);
$locale = timzy_clean($payload['locale'] ?? null, 8) ?: 'pl';
$startedAt = is_numeric($payload['startedAt'] ?? null) ? (int) $payload['startedAt'] : 0;
if (timzy_clean($payload['website'] ?? null, 200) !== '') {
    timzy_json(['ok' => true]);
}
if ($name === '' || $company === '' || $country === '' || $teamSize === '' || $industry === '' || ($payload['privacyAccepted'] ?? false) !== true || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    timzy_json(['ok' => false, 'code' => 'validation'], 400);
}
$now = (int) floor(microtime(true) * 1000);
if ($now - $startedAt < 2000 || $now - $startedAt > 7200000) {
    timzy_json(['ok' => false, 'code' => 'captcha'], 400);
}
$config = timzy_config();
$secret = (string) ($config['captcha_secret'] ?? '');
if ($secret === '' || !timzy_verify_captcha(timzy_clean($payload['captchaToken'] ?? null, 1200), timzy_clean($payload['captchaAnswer'] ?? null, 10), $secret)) {
    timzy_json(['ok' => false, 'code' => 'captcha'], 400);
}
try {
    timzy_send_contact_email($config, compact('name', 'company', 'email', 'phone', 'country', 'teamSize', 'contactTime', 'industry', 'message', 'locale'));
    timzy_json(['ok' => true]);
} catch (Throwable $error) {
    error_log('Timzy contact delivery failed: ' . $error->getMessage());
    timzy_json(['ok' => false, 'code' => 'delivery'], 502);
}
