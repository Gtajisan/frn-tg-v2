const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gay",
    version: "1.0",
    author: "Farhan",
    description: "Apply a pride overlay to a user's profile picture or replied image.",
    category: "fun",
    usage: "/gay (reply to user or image, or run without reply for your own pfp)",
    usePrefix: true,
    role: 0
  },

  onStart: async ({ bot, chatId, msg }) => {
    let targetUserId = msg.from.id;
    let targetUsername = msg.from.username || msg.from.first_name || "User";
    let imageUrl = null;

    try {
      // --- If replying to a message ---
      if (msg.reply_to_message) {
        if (msg.reply_to_message.photo) {
          // If the reply is to a photo
          const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
          const file = await bot.getFile(fileId);
          imageUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
          targetUsername = "Replied Image";
        } else {
          // If the reply is to a user (text, etc.)
          targetUserId = msg.reply_to_message.from.id;
          targetUsername = msg.reply_to_message.from.username || msg.reply_to_message.from.first_name || "User";

          const userProfile = await bot.getUserProfilePhotos(targetUserId, { limit: 1 });
          if (userProfile.total_count > 0) {
            const fileId = userProfile.photos[0][0].file_id;
            const file = await bot.getFile(fileId);
            imageUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
          }
        }
      } else {
        // --- If no reply: use sender's profile photo ---
        const userProfile = await bot.getUserProfilePhotos(targetUserId, { limit: 1 });
        if (userProfile.total_count > 0) {
          const fileId = userProfile.photos[0][0].file_id;
          const file = await bot.getFile(fileId);
          imageUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        }
      }

      // --- Default fallback image if none found ---
      if (!imageUrl) {
        imageUrl = "https://sus-apis.onrender.com/assets/images/logo.png";
      }

      // --- API Call for Pride Overlay ---
      const apiUrl = `https://sus-apis.onrender.com/api/pride-overlay?image=${encodeURIComponent(imageUrl)}`;
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `${targetUserId}_${Date.now()}.jpg`);

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, Buffer.from(response.data));

      // --- Caption logic ---
      let caption;
      if (msg.reply_to_message && !msg.reply_to_message.photo) {
        caption = `🌈🤣 Look, I found a gay! @${targetUsername}`;
      } else {
        caption = "🌈🤣 Look, I found a gay!";
      }

      // --- Send Result ---
      await bot.sendPhoto(chatId, filePath, { caption, reply_to_message_id: msg.message_id });

      // Cleanup
      fs.unlink(filePath).catch(() => {});
    } catch (error) {
      console.error("[gay] Error:", error.message);
      await bot.sendMessage(
        chatId,
        `❌ Failed to generate pride overlay.\nReason: ${error.message}`,
        { reply_to_message_id: msg.message_id }
      );
    }
  }
};
        
