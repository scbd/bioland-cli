<?php

// @codingStandardsIgnoreFile
include $app_root . '/sites/_common/settings.common.php';

$databases['default']['default']['database'] = "{{code}}";
$settings['environment'] = '{{environment}}';
$config['system.site']['chm_government'] = '{{chmGovernment}}';

$settings['file_private_path']='/tmp';
{{#if smtpCredentials}}
// Configure SMTP password for swiftmailer
$config['swiftmailer.transport']['smtp_credentials']['swiftmailer']['username'] = '{{smtpCredentials.username}}';
$config['swiftmailer.transport']['smtp_credentials']['swiftmailer']['password'] = '{{smtpCredentials.password}}';
{{/if}}
{{#if killCache}}
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);
$config['system.logging']['error_level'] = 'verbose';

$config['system.performance']['css']['preprocess'] = FALSE;
$config['system.performance']['js']['preprocess'] = FALSE;

$settings['cache']['bins']['render'] = 'cache.backend.php';
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.php';
$settings['cache']['bins']['page'] = 'cache.backend.php';
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.php';
{{/if}}