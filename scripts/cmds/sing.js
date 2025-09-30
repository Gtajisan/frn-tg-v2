const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "sing",
    version: "1.0",
    author: "Farhan",
    description: "Search and play music from YouTube, auto selects most viewed.",
    category: "media",
    usage: "/sing <song name>",
    usePrefix: true,
    role: 0
  },

  onStart: async ({ bot, chatId, args }) => {
    const query = args.join(" ").trim();
    if (!query) {
      return bot.sendMessage(chatId, "❌ Please provide a music name. Example: /sing Starboy");
    }

    let statusMsg;
    try {
      // 1. Send searching message
      statusMsg = await bot.sendMessage(chatId, `🔎 Searching for: ${query}`);

      // 2. Call YouTube search API
      const searchRes = await axios.get(
        `https://hridoy-apis.vercel.app/search/youtube?query=${encodeURIComponent(query)}&count=5&apikey=hridoyXQC`
      );
      const results = searchRes.data && searchRes.data.result;
      if (!Array.isArray(results) || results.length === 0) {
        return bot.editMessageText("❌ No music found.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      }

      // 3. Pick most viewed video
      let mostViewed = results[0];
      for (const vid of results) {
        if (vid.views > mostViewed.views) mostViewed = vid;
      }

      await bot.editMessageText("⬇️ Downloading...", {
        chat_id: chatId,
        message_id: statusMsg.message_id
      });

      // 4. Get MP3 download link
      const ytmp3Res = await axios.get(
        `https://hridoy-apis.vercel.app/downloader/ytmp4?url=${encodeURIComponent(mostViewed.url)}&format=mp3&apikey=hridoyXQC`
      );
      const downloadUrl = ytmp3Res.data?.result?.download;
      const musicTitle = ytmp3Res.data?.result?.title || mostViewed.title;
      const musicAuthor = mostViewed.author;
      const views = mostViewed.views?.toLocaleString?.() || mostViewed.views || "N/A";

      if (!downloadUrl) {
        return bot.editMessageText("❌ Failed to get music download link.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      }

      await bot.editMessageText("📤 Sending...", {
        chat_id: chatId,
        message_id: statusMsg.message_id
      });

      // 5. Download to cache
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `sing_${Date.now()}.mp3`);

      const audioRes = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 60000 });
      await fs.writeFile(filePath, Buffer.from(audioRes.data));

      // 6. Send audio
      const stats = fs.statSync(filePath);
      if (stats.size > 226214400) { // 205MB limit
        fs.unlinkSync(filePath);
        return bot.sendMessage(chatId, "❌ The file is too large to send (>205MB).");
      }

      await bot.sendAudio(chatId, fs.createReadStream(filePath), {
        caption: `🎶 ${musicTitle}\n👤 Author: ${musicAuthor}\n👁️ Views: ${views}`
      });

      fs.unlink(filePath).catch(() => {});
      if (statusMsg?.message_id) {
        bot.deleteMessage(chatId, statusMsg.message_id);
      }

    } catch (error) {
      console.error("[sing] Error:", error);
      if (statusMsg?.message_id) {
        bot.editMessageText("❌ Error occurred while processing your request.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      } else {
        bot.sendMessage(chatId, "❌ Error occurred while processing your request.");
      }
    }
  }
};
