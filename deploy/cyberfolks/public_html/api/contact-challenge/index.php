<?php
declare(strict_types=1);

require dirname(__DIR__) . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    timzy_json(['ok' => false, 'code' => 'method'], 405);
}
$config = timzy_config();
$secret = (string) ($config['captcha_secret'] ?? '');
if ($secret === '') {
    timzy_json(['ok' => false, 'code' => 'configuration'], 503);
}
timzy_json(timzy_create_captcha($secret));
