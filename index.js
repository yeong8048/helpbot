// 슬랙 이벤트 처리용 핸들러 (Vercel 서버리스 대응)
// 설치 패키지: npm install @slack/bolt dotenv

const { App, ExpressReceiver } = require('@slack/bolt');
require('dotenv').config();

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID;

// DM 메시지 처리
app.message(async ({ message, client, logger }) => {
  try {
    if (message.channel_type === 'im' && !message.bot_id) {
      await client.chat.postMessage({
        channel: ADMIN_CHANNEL_ID,
        text: `📩 [불편사항이 접수되었어요] ${message.text}`
      });

      await client.chat.postMessage({
        channel: message.channel,
        text: '의견 감사해요 🙏 익명으로 피플팀에 전달했어요.'
      });
    }
  } catch (error) {
    logger.error(error);
  }
});

// Vercel에 맞는 API 핸들러로 내보내기
module.exports = receiver.router;
