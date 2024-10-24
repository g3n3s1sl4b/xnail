require("dotenv").config(); // Use process.env.*

let HOST_URL, HTTPS_PORT, HTTP_PORT, KEY_DIR, TLG_BOT, CHAT_ID;
console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  HOST_URL = "http://localhost";
  HTTPS_PORT = 4433;
  HTTP_PORT = 3000;
  KEY_DIR = "./key";
}

if (process.env.NODE_ENV === "production") {
  HOST_URL = "http://xnail.shop";
  HTTPS_PORT = 443;
  HTTP_PORT = 80;
  KEY_DIR = "/etc/letsencrypt/live/xnail.shop";
}

TLG_BOT = "";
CHAT_ID = "";

module.exports = {
  TLG_BOT,
  CHAT_ID,
  HOST_URL,
  HTTP_PORT,
  HTTPS_PORT,
  KEY_DIR,
};
