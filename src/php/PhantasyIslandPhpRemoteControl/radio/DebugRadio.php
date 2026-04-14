<?php

require_once __DIR__ . '/RadioManager.php';
require_once __DIR__ . '/ApiModule.php';

use PhantasyIslandPhpRemoteControl\Radio\RadioManager;
use function PhantasyIslandPhpRemoteControl\Radio\as_sync;

$rm = new RadioManager();
$rm->connect();

echo $rm->create_msg_timestamp_id() . PHP_EOL;

echo json_encode($rm->ping()) . PHP_EOL;

// sync 模式（默认）
$data = as_sync($rm->radioApi->listRadioLocalObjectsIds());
print_r($data);

echo 'isSceneInit: ' . ($rm->radioApi->isSceneInit() ? 'true' : 'false') . PHP_EOL;
echo 'isRadioReachabilityCheckerInit: ' . ($rm->radioApi->isRadioReachabilityCheckerInit() ? 'true' : 'false') . PHP_EOL;
print_r($rm->radioApi->getAllRadioMaterial());
print_r($rm->radioApi->localRadioMaterial());
print_r($rm->radioApi->listRadioLocalObjectsIds());
