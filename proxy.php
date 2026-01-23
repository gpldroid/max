<?php
$url = $_GET['url'] ?? null;
if(!$url) exit;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/vnd.apple.mpegurl");

readfile($url);
