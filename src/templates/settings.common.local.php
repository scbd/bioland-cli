<?php
{{#if defaultSmtpCredentials}}
// Configure SMTP password for swiftmailer
$config['swiftmailer.transport']['smtp_credentials']['swiftmailer']['username'] = '{{defaultSmtpCredentials.username}}';
$config['swiftmailer.transport']['smtp_credentials']['swiftmailer']['password'] = '{{defaultSmtpCredentials.password}}';
{{/if}}

$settings['reverse_proxy'] = TRUE;
$settings['reverse_proxy_addresses'] = array($_SERVER['REMOTE_ADDR']);

