// Mazii Premium Unlocker (Robust Version)
let body = $response.body;
if (!body) $done({});

try {
    let obj = JSON.parse(body);

    const unlock = (user) => {
        if (!user) return;
        user.is_premium = 1;
        user.premium = 1;
        user.premium_expired_date = "2099-12-31 23:59:59";
        user.expire_date = "2099-12-31";
        user.lifetime = 1;
        user.is_lifetime = 1;
        user.ads = 0;
        user.type = 1; // 1 often means Premium/VIP
    };

    // 1. Direct object (Top level)
    if (typeof obj.is_premium !== 'undefined' || obj.username) {
        unlock(obj);
    }

    // 2. Wrapped in 'data' (Common for Mazii app)
    if (obj.data) {
        unlock(obj.data);
        if (obj.data.user) unlock(obj.data.user);
    }

    // 3. Wrapped in 'result' (Common for Mazii web/API)
    if (obj.result) {
        unlock(obj.result);
        if (obj.result.user) unlock(obj.result.user);
    }

    // 4. Handle success flag if present
    if (obj.status) obj.status = 200;
    if (typeof obj.success !== 'undefined') obj.success = true;

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}