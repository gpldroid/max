<?php
if (!isset($_GET['url'])) exit("No URL");

$url = urldecode($_GET['url']);
if (!filter_var($url, FILTER_VALIDATE_URL)) exit("Invalid URL");

function isM3U8($url) {
    return stripos($url, ".m3u8") !== false;
}

$headers = [
    "User-Agent: Mozilla/5.0",
    "Accept: */*",
    "Connection: keep-alive",
];

if (isset($_SERVER['HTTP_RANGE'])) {
    $headers[] = "Range: " . $_SERVER['HTTP_RANGE'];
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_HTTPHEADER => $headers,
]);

$response = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

header("Access-Control-Allow-Origin: *");

if (isM3U8($url)) {
    header("Content-Type: application/vnd.apple.mpegurl");

    $base = dirname($url);
    $lines = explode("\n", $response);
    $newLines = [];

    foreach ($lines as $line) {
        $trim = trim($line);

        if ($trim === "" || str_starts_with($trim, "#")) {
            $newLines[] = $line;
            continue;
        }

        if (!preg_match("#^https?://#i", $trim)) {
            $absoluteUrl = $base . "/" . $trim;
        } else {
            $absoluteUrl = $trim;
        }

        $newLines[] = "proxy.php?url=" . urlencode($absoluteUrl);
    }

    echo implode("\n", $newLines);
    exit;
}

header("Content-Type: " . ($contentType ?: "application/octet-stream"));
echo $response;
