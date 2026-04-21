// Mazii Premium Unlocker
try {
    let body = $response.body;
    let obj = JSON.parse(body);

    if (obj.result) {
        obj.result.premium = true;
        obj.result.is_premium = true;
        obj.result.expire_date = "2099-12-31 23:59:59";
        obj.result.lifetime = true;
    } else if (obj.data) {
        obj.data.premium = 1;
        obj.data.is_premium = true;
        obj.data.expire_date = "2099-12-31";
        obj.data.lifetime = true;
    } else {
        obj.premium = true;
        obj.is_premium = true;
        obj.expire_date = "2099-12-31";
    }

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}