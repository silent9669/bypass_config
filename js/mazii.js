// Mazii Premium Unlocker (Shadowrocket/Surge/QuantumultX)
var body = $response && $response.body ? $response.body : "";
var url = $request && $request.url ? $request.url : "";

if (!body) {
  $done({});
  return;
}

try {
  var obj = JSON.parse(body);

  var FAR_DATE = "2099-12-31 23:59:59";
  var FAR_DATE_SHORT = "2099-12-31";
  var FAR_TS = 4102444799;

  var BOOL_KEYS = {
    is_premium: 1,
    premium: 1,
    premium_enabled: 1,
    is_vip: 1,
    vip: 1,
    vip_enabled: 1,
    is_pro: 1,
    pro: 1,
    paid: 1,
    is_lifetime: 1,
    lifetime: 1,
    no_ads: 1,
    ads_free: 1,
    remove_ads: 1,
    active: 1,
    is_active: 1,
    subscribed: 1
  };

  var LEVEL_KEYS = {
    vip_level: 1,
    premium_level: 1,
    member_level: 1,
    user_type: 1,
    account_type: 1,
    plan_type: 1,
    type: 1
  };

  var STATUS_KEYS = {
    subscription_status: 1,
    premium_status: 1,
    vip_status: 1,
    member_status: 1,
    status: 1
  };

  var DATE_KEY_RE = /exp|expire|expiry|valid_until|end_time|renew/i;

  function isObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function coerceTruthy(original) {
    if (typeof original === "boolean") return true;
    if (typeof original === "number") return 1;
    if (typeof original === "string") return "1";
    return true;
  }

  function coerceLevel(original) {
    if (typeof original === "string") return "9";
    if (typeof original === "number") return original > 0 ? original : 9;
    return 9;
  }

  function coerceDate(original, key) {
    if (typeof original === "number") return FAR_TS;
    if (/date/i.test(key)) return FAR_DATE_SHORT;
    return FAR_DATE;
  }

  function patchKnownKeys(target) {
    var keys = Object.keys(target);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var lower = key.toLowerCase();
      var val = target[key];

      if (BOOL_KEYS[lower]) {
        target[key] = coerceTruthy(val);
        continue;
      }

      if (LEVEL_KEYS[lower]) {
        target[key] = coerceLevel(val);
        continue;
      }

      if (STATUS_KEYS[lower]) {
        target[key] = typeof val === "number" ? 1 : "active";
        continue;
      }

      if (DATE_KEY_RE.test(lower)) {
        target[key] = coerceDate(val, key);
      }
    }
  }

  function forcePremium(target) {
    if (!isObject(target)) return;

    target.is_premium = true;
    target.premium = true;
    target.is_vip = true;
    target.vip = true;
    target.is_pro = true;
    target.pro = true;
    target.paid = true;
    target.is_lifetime = true;
    target.lifetime = true;
    target.no_ads = true;
    target.active = true;
    target.is_active = true;
    target.subscribed = true;

    target.vip_level = 9;
    target.premium_level = 9;
    target.member_level = 9;
    target.user_type = 1;

    target.premium_status = "active";
    target.vip_status = "active";
    target.subscription_status = "active";
    target.status = "active";

    target.expire_date = FAR_DATE_SHORT;
    target.expired_date = FAR_DATE_SHORT;
    target.premium_expired_date = FAR_DATE;
    target.expires_at = FAR_TS;
    target.expire_at = FAR_TS;
    target.expiredAt = FAR_DATE;
    target.expiresAt = FAR_DATE;

    target.productId = "com.mazii.premium.annual";
    target.planId = "premium_annual";

    if (typeof target.ads !== "undefined") target.ads = 0;
    if (typeof target.ad !== "undefined") target.ad = 0;
  }

  function walk(node, seen) {
    if (!node || typeof node !== "object") return;
    if (seen.indexOf(node) !== -1) return;
    seen.push(node);

    if (isObject(node)) patchKnownKeys(node);

    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) walk(node[i], seen);
      return;
    }

    var keys = Object.keys(node);
    for (var j = 0; j < keys.length; j++) walk(node[keys[j]], seen);
  }

  function pickByPath(root, path) {
    var parts = path.split(".");
    var cur = root;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== "object") return null;
      cur = cur[parts[i]];
    }
    return isObject(cur) ? cur : null;
  }

  function hasPremiumSignal(root) {
    var found = false;

    function scan(node) {
      if (found || !node || typeof node !== "object") return;

      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) scan(node[i]);
        return;
      }

      var keys = Object.keys(node);
      for (var j = 0; j < keys.length; j++) {
        var lower = keys[j].toLowerCase();
        if (BOOL_KEYS[lower] || LEVEL_KEYS[lower] || STATUS_KEYS[lower] || DATE_KEY_RE.test(lower)) {
          found = true;
          return;
        }
      }

      for (var x = 0; x < keys.length; x++) scan(node[keys[x]]);
    }

    scan(root);
    return found;
  }

  var isSubsEndpoint = /\/api\/subs?$/i.test(url);
  var profileLikeUrl = /\/api\/(me|profile|user|account|member|subscription|premium|vip)/i.test(url);
  var shouldPatch = isSubsEndpoint || profileLikeUrl || hasPremiumSignal(obj);

  if (!shouldPatch) {
    $done({ body: body });
    return;
  }

  walk(obj, []);

  var candidates = [
    "data",
    "result",
    "user",
    "profile",
    "account",
    "member",
    "subscription",
    "data.user",
    "data.profile",
    "data.account",
    "data.subscription",
    "result.user",
    "result.profile",
    "result.account",
    "result.subscription"
  ];

  for (var c = 0; c < candidates.length; c++) {
    var target = pickByPath(obj, candidates[c]);
    if (target) forcePremium(target);
  }

  if (isObject(obj)) forcePremium(obj);
  if (typeof obj.success !== "undefined") obj.success = true;

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({ body: body });
}
