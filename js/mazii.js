// Mazii Premium Unlocker
try {
    let body = $response.body;
    let obj = JSON.parse(body);

    const modifyPremium = (userObj) => {
        if (!userObj) return;
        userObj.premium = 1;
        userObj.is_premium = 1;
        userObj.expire_date = "2099-12-31 23:59:59";
        userObj.premium_expired_date = "2099-12-31 23:59:59";
        userObj.lifetime = 1;
        userObj.is_lifetime = 1;
    };

    // Sometimes the profile is at the root
    if (obj.username || typeof obj.is_premium !== 'undefined') {
        modifyPremium(obj);
    }
    
    // Sometimes it's inside result or data
    if (obj.result) {
        modifyPremium(obj.result);
        if (obj.result.user) modifyPremium(obj.result.user);
    } 
    
    if (obj.data) {
        modifyPremium(obj.data);
        if (obj.data.user) modifyPremium(obj.data.user);
    }

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}