UPDATE `markets`
SET `activation_fee_open_minor` = 39900,
    `activation_stripe_product_id` = NULL,
    `activation_stripe_price_id` = NULL,
    `updated_at` = CURRENT_TIMESTAMP
WHERE `code` = 'PL';
