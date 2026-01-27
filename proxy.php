<?php

if (!isset($_GET['url'])) {
    http_response_code(400);
    exit("No URL");
}

$url = urldecode($_GET['url']);

// حماية أساسية (اختياري)
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit("Invalid URL");
}

$ch = curl_init($url);

$headers = [
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept: */*",
    "Connection: keep-alive",
];

// تمرير Range إذا موجود (مهم للفيديو)
if (isset($_SERVER['HTTP_RANGE'])) {
    $headers[] = "Range: " . $_SERVER['HTTP_RANGE'];
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => false,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_HEADERFUNCTION => function($curl, $header) {
        $len = strlen($header);

        // تمرير أهم الهيدرز فقط
        if (stripos($header, 'Content-Type:') === 0 ||
            stripos($header, 'Content-Length:') === 0 ||
            stripos($header, 'Accept-Ranges:') === 0 ||
            stripos($header, 'Content-Range:') === 0) {
            header($header);
        }

        return $len;
    },
]);

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Range");
header("Access-Control-Expose-Headers: Content-Length, Content-Range");

// تنفيذ الطلب
curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(502);
    echo "Proxy Error: " . curl_error($ch);
}

curl_close($ch);
