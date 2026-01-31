<?php
// إعدادات السماح لجميع الأطراف (تجاوز CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// الحصول على الرابط المطلوب جلب بياناته
$url = isset($_GET['url']) ? $_GET['url'] : null;

if (!$url) {
    echo json_encode(["error" => "No URL provided"]);
    exit;
}

// التأكد من صحة الرابط
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(["error" => "Invalid URL"]);
    exit;
}

// استخدام cURL لجلب البيانات بدقة
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // لتجاوز مشاكل شهادات SSL القديمة في السيرفرات
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    // إذا كانت البيانات JSON (قوائم القنوات) نرسلها كما هي
    // أما إذا كانت ملف بث (M3U8) سنغير الـ Header لاحقاً في ملف البث
    echo $response;
} else {
    http_response_code($httpCode);
    echo json_encode(["error" => "Failed to fetch data", "code" => $httpCode]);
}
?>
