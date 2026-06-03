const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ذخیره موقت
let requests = [];

/* =======================
   API برای اپ (Frontend)
======================= */

// ارسال درخواست از اپ
app.post("/request", (req, res) => {
  const { token: userToken, chatId } = req.body;

  const id = requests.length;

  requests.push({
    id,
    chatId,
    token: userToken,
    status: "pending"
  });

  res.json({ success: true, id });
});

// گرفتن لیست درخواست‌ها
app.get("/requests", (req, res) => {
  res.json(requests);
});

/* =======================
   تلگرام (ادمین)
======================= */

bot.onText(/\/list/, (msg) => {
  let text = "📋 Requests:\n\n";

  requests.forEach(r => {
    text += `${r.id} | ${r.token} | ${r.status}\n`;
  });

  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/approve (.+)/, (msg, match) => {
  const id = match[1];
  if (requests[id]) {
    requests[id].status = "approved";
    bot.sendMessage(requests[id].chatId, "✅ تایید شد");
  }
});

bot.onText(/\/reject (.+)/, (msg, match) => {
  const id = match[1];
  if (requests[id]) {
    requests[id].status = "rejected";
    bot.sendMessage(requests[id].chatId, "❌ رد شد");
  }
});

/* =======================
   Start Server
======================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API + Bot running on port " + PORT);
});
