const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "goku",
    version: "1.0",
    author: "Farhan",
    description: "AI Image Editing with Gemini Nano Banana API",
    category: "image",
    usage: "/goku [prompt] (reply to an image)\nExample: /goku make it cyberpunk",
    usePrefix: true,
    role: 0
  },

  onStart: async function ({ bot, chatId, args, msg }) {
    const prompt = args.join(" ");
    const reply = msg?.reply_to_message;

    if (!prompt || !reply || !reply.photo) {
      return bot.sendMessage(
        chatId,
        "⚠️ Please reply to a photo with a prompt.\nExample: /goku make it anime"
      );
    }

    const waitMsg = await bot.sendMessage(
      chatId,
      `🧪 Editing image with prompt: "${prompt}"...\nPlease wait...`
    );

    // Pick highest quality photo file_id
    const photo = reply.photo[reply.photo.length - 1];
    try {
      const file = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      const apiURL = `https://nexalo-api.vercel.app/api/ai-canvas?url=${encodeURIComponent(
        fileUrl
      )}&prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiURL, { responseType: "arraybuffer" });
      const imgData = Buffer.from(res.data, "binary");

      await bot.sendPhoto(chatId, imgData, {
        caption: `✅ Edited image with prompt: "${prompt}"`
      });

      bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    } catch (err) {
      console.error("GOKU CMD Error:", err);
      bot.sendMessage(chatId, "❌ Failed to edit image. Please try again later.");
    }
  }
};
