var body = JSON.parse($response.body);

var far_future = "2099-01-09T10:10:14Z";
var past_date = "2020-01-09T10:10:14Z";

var subInfo = {
    "expires_date": far_future,
    "original_purchase_date": past_date,
    "purchase_date": past_date,
    "ownership_type": "PURCHASED",
    "store": "app_store",
    "is_sandbox": false
};

if (body && body.subscriber) {
    if (!body.subscriber.entitlements) body.subscriber.entitlements = {};
    if (!body.subscriber.subscriptions) body.subscriber.subscriptions = {};

    // 1. Extend all existing entitlements/subscriptions
    for (var key in body.subscriber.entitlements) {
        body.subscriber.entitlements[key].expires_date = far_future;
    }
    for (var k in body.subscriber.subscriptions) {
        body.subscriber.subscriptions[k].expires_date = far_future;
    }

    // 2. Inject common keys for unknown apps (like Mazii which uses "premium")
    var commonEntitlements = ["pro", "premium", "vip", "Gold", "Premium", "lifetime"];
    for (var i = 0; i < commonEntitlements.length; i++) {
        var entKey = commonEntitlements[i];
        if (!body.subscriber.entitlements[entKey]) {
            body.subscriber.entitlements[entKey] = {
                "expires_date": far_future,
                "product_identifier": "com.app." + entKey.toLowerCase(),
                "purchase_date": past_date
            };
        }
    }
    
    // Inject a generic subscription for those common entitlements
    body.subscriber.subscriptions["com.app.premium"] = subInfo;
    body.subscriber.subscriptions["com.app.pro"] = subInfo;
    body.subscriber.subscriptions["com.app.vip"] = subInfo;
    body.subscriber.subscriptions["com.app.gold"] = subInfo;

    // 3. Locket specific overrides
    var ua = $request.headers["User-Agent"] || $request.headers["user-agent"] || "";
    if (ua.indexOf("Locket") !== -1) {
        body.subscriber.entitlements["Gold"] = {
            "expires_date": far_future,
            "product_identifier": "locket_1600_1y",
            "purchase_date": past_date
        };
        body.subscriber.subscriptions["locket_1600_1y"] = subInfo;
    }
}

$done({ body: JSON.stringify(body) });