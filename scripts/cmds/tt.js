const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "tt",
    version: "1.0",
    author: "Farhan",
    description: "Search and get a random TikTok video by query.",
    category: "media",
    usage: "/tt <any video query>",
    usePrefix: true,
    role: 0
  },

  onStart: async ({ bot, chatId, args }) => {
    const query = args.join(" ").trim();
    if (!query) {
      return bot.sendMessage(chatId, "❌ Please provide a video query. Example: /tt freefire");
    }

    let statusMsg;
    try {
      // 1. Send searching message
      statusMsg = await bot.sendMessage(chatId, `🔎 Searching TikTok videos for: ${query}`);

      // 2. Search API
      const searchRes = await axios.get(
        `https://hridoy-apis.vercel.app/search/tiktok?query=${encodeURIComponent(query)}&count=5&apikey=hridoyXQC`
      );
      const videos = searchRes.data?.data?.videos;
      if (!Array.isArray(videos) || videos.length === 0) {
        return bot.editMessageText("❌ No TikTok videos found.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      }

      // 3. Pick random video
      const video = videos[Math.floor(Math.random() * videos.length)];
      if (!video?.wmplay) {
        return bot.editMessageText("❌ Could not get a valid TikTok video.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      }

      await bot.editMessageText("⬇️ Downloading TikTok video...", {
        chat_id: chatId,
        message_id: statusMsg.message_id
      });

      // 4. Download to cache
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `tt_${Date.now()}.mp4`);

      const vidRes = await axios.get(video.wmplay, { responseType: "arraybuffer", timeout: 80000 });
      await fs.writeFile(filePath, Buffer.from(vidRes.data));

      const authorNick = video.author?.nickname || video.author?.unique_id || "Unknown";
      const title = video.title || "No title";
      const views = video.play_count?.toLocaleString?.() || video.play_count || "N/A";
      const duration = video.duration ? `${video.duration}s` : "N/A";

      await bot.editMessageText("📤 Sending video...", {
        chat_id: chatId,
        message_id: statusMsg.message_id
      });

      // 5. Send video
      await bot.sendVideo(chatId, fs.createReadStream(filePath), {
        caption: `🎬 ${title}\n👤 Author: ${authorNick}\n👁️ Views: ${views}\n⏱️ Duration: ${duration}`
      });

      // Cleanup
      fs.unlink(filePath).catch(() => {});
      if (statusMsg?.message_id) {
        bot.deleteMessage(chatId, statusMsg.message_id);
      }

    } catch (error) {
      console.error("[tt] Error:", error);
      if (statusMsg?.message_id) {
        bot.editMessageText("❌ Error occurred while processing your TikTok request.", {
          chat_id: chatId,
          message_id: statusMsg.message_id
        });
      } else {
        bot.sendMessage(chatId, "❌ Error occurred while processing your TikTok request.");
      }
    }
  }
};
