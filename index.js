// 설치해야 하는 패키지:
// npm install @slack/bolt dotenv

require('dotenv').config();
const { App } = require('@slack/bolt');

// 앱 초기화
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,             // 슬랙 봇 토큰
  signingSecret: process.env.SLACK_SIGNING_SECRET // 서명 시크릿
});

const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID; // 관리자 채널 ID

// 🔐 슬랙이 URL을 검증할 때 사용하는 challenge 처리
app.event('url_verification', async ({ body, ack }) => {
  await ack(body.challenge);
});

// 📩 DM 수신 핸들링
app.message(async ({ message, client, logger }) => {
  try {
    if (message.channel_type === 'im' && !message.bot_id) {
      // 관리자에게 불편사항 전달
      await client.chat.postMessage({
        channel: ADMIN_CHANNEL_ID,
        text: `📩 [불편사항이 접수되었습니다!] ${message.text}`
      });

      // 사용자에게 응답
      await client.chat.postMessage({
        channel: message.channel,
        text: '의견 남겨주셔서 감사합니다. 피플팀에 전달했어요 🙏'
      });
    }
  } catch (error) {
    logger.error('QuietBot 오류:', error);
  }
});

// 🚀 서버 실행
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('✅ QuietBot 작동 중...');
})();
