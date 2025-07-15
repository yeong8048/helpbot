export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { type, challenge, event } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  if (event?.type === 'message' && event.channel_type === 'im' && !event.bot_id) {
    const token = process.env.SLACK_BOT_TOKEN;
    const adminChannel = process.env.ADMIN_CHANNEL_ID;

    try {
      // 관리자 채널로 메시지 전달
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: adminChannel,
          text: `📩 [불편사항 접수] ${event.text}`
        })
      });

      // 사용자에게 응답
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: event.channel,
          text: '소중한 의견 감사합니다 🙏 피플팀에 전달했어요.'
        })
      });

      return res.status(200).send('OK');
    } catch (error) {
      console.error('QuietBot 오류:', error);
      return res.status(500).send('Failed');
    }
  }

  return res.status(200).send('No action needed');
}

