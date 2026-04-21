// Universal RevenueCat Unlocker (Mazii, Locket, etc.)
let body = JSON.parse($response.body);

let far_future = "2099-08-01T00:00:00Z";

if (body && body.subscriber) {
  if (body.subscriber.entitlements) {
    for (let key in body.subscriber.entitlements) {
      body.subscriber.entitlements[key].expires_date = far_future;
      body.subscriber.entitlements[key].purchase_date = "2020-01-01T00:00:00Z";
    }
  }

  if (body.subscriber.subscriptions) {
    for (let key in body.subscriber.subscriptions) {
      body.subscriber.subscriptions[key].expires_date = far_future;
      body.subscriber.subscriptions[key].purchase_date = "2020-01-01T00:00:00Z";
      body.subscriber.subscriptions[key].original_purchase_date = "2020-01-01T00:00:00Z";
    }
  }
}

$done({ body: JSON.stringify(body) });