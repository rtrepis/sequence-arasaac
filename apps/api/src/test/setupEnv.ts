// Variables d'entorn per als tests.
//
// S'executa abans que cap mòdul de l'aplicació es carregui, perquè config/env.ts
// atura el procés si en falta cap. Els valors són ficticis a propòsit: cap test
// ha de connectar-se a res de real, i sense RESEND_API_KEY el mailer escriu per
// consola en comptes d'enviar correus.

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";
process.env.IP_HASH_SECRET = "test-ip-hash-secret";
process.env.RESEND_API_KEY = "";
