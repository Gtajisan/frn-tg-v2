const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  name: "ng",
  version: "1.0.0",
  author: "Farhan",
  usePrefix: true,
  adminOnly: false,
  allowedGroupOnly: false,
  verify: true,
  guide: `Reply to an image or user message with ${config.botPrefix}nia to apply green screen effect.`,

  async execute(ctx) {
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    const userId = ctx.from.id.toString();

    let imageUrl = 'https://sus-apis.onrender.com/assets/images/logo.png'; // fallback
    let targetUserId = userId;

    // If user replied to a message
    if (ctx.message.reply_to_message) {
      const reply = ctx.message.reply_to_message;

      // If reply contains a photo
      if (reply.photo) {
        const fileId = reply.photo[reply.photo.length - 1].file_id;
        const file = await ctx.telegram.getFile(fileId);
        imageUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`;
      } else {
        // Otherwise, try to get profile pic of replied user
        targetUserId = reply.from.id.toString();
        try {
          const userProfile = await ctx.telegram.getUserProfilePhotos(targetUserId, { limit: 1 });
          if (userProfile.total_count > 0) {
            const fileId = userProfile.photos[0][0].file_id;
            const file = await ctx.telegram.getFile(fileId);
            imageUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`;
          }
        } catch (e) {
          console.error('Error fetching replied user profile photo:', e.message);
        }
      }
    } else {
      // If no reply, get caller’s own profile pic
      try {
        const userProfile = await ctx.telegram.getUserProfilePhotos(userId, { limit: 1 });
        if (userProfile.total_count > 0) {
          const fileId = userProfile.photos[0][0].file_id;
          const file = await ctx.telegram.getFile(fileId);
          imageUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`;
        }
      } catch (e) {
        console.error('Error fetching user profile photo:', e.message);
      }
    }

    const waitMessage = await ctx.reply('⏳ Applying green screen effect...');

    try {
      // Call API
      const apiUrl = `https://sus-apis.onrender.com/api/green-screen?image=${encodeURIComponent(imageUrl)}`;
      const tempDir = path.join(__dirname, '..', 'temp');
      const tempFilePath = path.join(tempDir, `${targetUserId}_${Date.now()}.jpg`);

      await fs.mkdir(tempDir, { recursive: true });
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      if (response.status !== 200) throw new Error('Failed to generate green screen image');

      await fs.writeFile(tempFilePath, Buffer.from(response.data));

      await ctx.replyWithPhoto({ source: tempFilePath }, {
        caption: "🌳 Here's your green screen effect!",
        reply_to_message_id: messageId
      });

      await fs.unlink(tempFilePath).catch(err =>
        console.error('Error deleting temp file:', err.message)
      );
    } catch (err) {
      console.error('Error generating green screen:', err.message);
      await ctx.reply(`❌ Failed to generate green screen image.\nReason: ${err.message}`, {
        reply_to_message_id: messageId
      });
    } finally {
      try {
        await ctx.telegram.deleteMessage(chatId, waitMessage.message_id);
      } catch (e) {
        console.warn('Could not delete wait message:', e.message);
      }
    }
  }
};
      
