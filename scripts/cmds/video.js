const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "alldl",
    version: "1.0.5",
    author: "Farhan",
    description: "Download video from TikTok, Facebook, Instagram, YouTube, Imgur, and more.",
    category: "media",
    usage: "/alldl [url]",
    usePrefix: true,
    role: 0
  },

  onStart: async ({ bot, chatId, args, msg }) => {
    const inputUrl = args[0] || (msg.reply_to_message && msg.reply_to_message.text);

    if (!inputUrl) {
      return bot.sendMessage(chatId, "❌ Please provide a valid video URL.");
    }

    let statusMsg;
    try {
      // Notify searching/downloading
      statusMsg = await bot.sendMessage(chatId, "⏳ Fetching download link...");

      // API call
      const { data } = await axios.get(
        `${await baseApiUrl()}/alldl?url=${encodeURIComponent(inputUrl)}`
      );

      if (!data || !data.result) {
        await bot.editMessageText("⚠️ Could not fetch a valid download link. Please try another URL.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
        return;
      }

      // Ensure cache directory
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      // Download media
      const filePath = path.join(cacheDir, `alldl_${Date.now()}.mp4`);
      const fileBuffer = (await axios.get(data.result, { responseType: "arraybuffer" })).data;
      await fs.writeFile(filePath, Buffer.from(fileBuffer));

      // Send video or image depending on type
      let caption = `${data.cp || "✅ Download Complete"}\n🔗 Link: ${data.result}`;
      const stats = fs.statSync(filePath);

      if (stats.size > 50000000) { // 50MB limit for Telegram
        caption += "\n⚠️ File is too large for direct send, use the link instead.";
        await bot.editMessageText(caption, {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
        fs.unlink(filePath).catch(() => {});
      } else {
        await bot.editMessageText("📤 Sending file...", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });

        await bot.sendVideo(chatId, fs.createReadStream(filePath), { caption });
        fs.unlink(filePath).catch(() => {});
      }

      // Handle Imgur direct download
      if (inputUrl.startsWith("https://i.imgur.com")) {
        const ext = inputUrl.substring(inputUrl.lastIndexOf("."));
        const imgFile = path.join(cacheDir, `imgur_${Date.now()}${ext}`);

        const imgBuffer = (await axios.get(inputUrl, { responseType: "arraybuffer" })).data;
        await fs.writeFile(imgFile, Buffer.from(imgBuffer));

        await bot.sendPhoto(chatId, fs.createReadStream(imgFile), {
          caption: "✅ Downloaded from Imgur"
        });

        fs.unlink(imgFile).catch(() => {});
      }

      if (statusMsg?.message_id) {
        await bot.deleteMessage(chatId, statusMsg.message_id);
      }

    } catch (error) {
      console.error("[alldl] Error:", error);
      if (statusMsg?.message_id) {
        await bot.editMessageText(`❌ Error: ${error.message}`, {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      } else {
        await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    }
  }
};
