import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const pub = publicKey.export({ format: "jwk" });
const priv = privateKey.export({ format: "jwk" });

if (!pub.x || !pub.y || !priv.d) throw new Error("VAPID key generation failed");
const decode = (value) => Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4), "base64");
const publicBytes = Buffer.concat([Buffer.from([4]), decode(pub.x), decode(pub.y)]);
const publicVapid = publicBytes.toString("base64url");
const privateVapid = priv.d;

console.log("WEB_PUSH_VAPID_PUBLIC_KEY=" + publicVapid);
console.log("WEB_PUSH_VAPID_PRIVATE_KEY=" + privateVapid);
console.log("WEB_PUSH_VAPID_SUBJECT=mailto:your-admin-email@example.com");
console.log("\nBu değerlerin PRIVATE olanını yalnız Supabase Secret olarak saklayın; repoya commit etmeyin.");
