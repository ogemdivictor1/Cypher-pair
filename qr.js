const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const pino = require("pino");

const {
  makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const { upload } = require('./mega');

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();

  async function MALVIN_XD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    const version = await fetchLatestBaileysVersion();

    try {
      let sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop")
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;

        if (qr) {
          res.setHeader('Content-Type', 'image/png');
          res.end(await QRCode.toBuffer(qr));
        }

        if (connection === "open") {
          await delay(5000);
          let rf = path.join(__dirname, `/temp/${id}/creds.json`);
          let data = fs.readFileSync(rf);

          function generateRandomText() {
            const prefix = "3EB";
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let randomText = prefix;
            for (let i = prefix.length; i < 22; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length);
              randomText += characters.charAt(randomIndex);
            }
            return randomText;
          }

          const randomText = generateRandomText();

          try {
            const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
            const string_session = mega_url.replace('https://mega.nz/file/', '');
            let md = "malvin~" + string_session;
            let code = await sock.sendMessage(sock.user.id, { text: md });

            let desc = `*Hey there, MALVIN-XD User!* 👋🏻

Thanks for using *CYPHER-PAIR* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029VbBWBqG84OmAohvemP1e

> *© Powered by CYPHER DEALS*
Stay cool and hack smart. ✌🏻`;

            await sock.sendMessage(sock.user.id, {
              text: desc,
              contextInfo: {
                externalAdReply: {
                  title: "ᴍᴀʟᴠɪɴ-xᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉",
                  thumbnailUrl: "https://files.catbox.moe/bqs70b.jpg",
                  sourceUrl: "https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A",
                  mediaType: 1,
                  renderLargerThumbnail: true
                }
              }
            }, { quoted: code });

          } catch (e) {
            let ddd = await sock.sendMessage(sock.user.id, { text: e });

            let desc = `*Hey there, MALVIN-XD User!* 👋🏻

Thanks for using *CYPHER-PAIR* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029VbBWBqG84OmAohvemP1e

> *© Powered by CYPHER DEALS*
Stay cool and hack smart. ✌🏻*`;

            await sock.sendMessage(sock.user.id, {
              text: desc,
              contextInfo: {
                externalAdReply: {
                  title: "ᴍᴀʟᴠɪɴ-xᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉 ✅",
                  thumbnailUrl: "https://files.catbox.moe/bqs70b.jpg",
                  sourceUrl: "https://whatsapp.com/channel/0029VbBWBqG84OmAohvemP1e",
                  mediaType: 2,
                  renderLargerThumbnail: true,
                  showAdAttribution: true
                }
              }
            }, { quoted: ddd });
          }

          await delay(10);
          await sock.ws.close();
          await removeFile('./temp/' + id);
          console.log(`👤 ${sock.user.id} Connected ✅ Restarting process...`);
          await delay(10);
          process.exit();
        } else if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode !== 401
        ) {
          await delay(10);
          MALVIN_XD_PAIR_CODE();
        }
      });
    } catch (err) {
      console.log("Service restarted due to error");
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: "❗ Service Unavailable" });
      }
    }
  }

  await MALVIN_XD_PAIR_CODE();
});

setInterval(() => {
  console.log("☘️ Restarting process...");
  process.exit();
}, 180000); // 30min

module.exports = router;
