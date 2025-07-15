export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { type, challenge, event } = req.body;

  // 👋 Slack URL 검증용 challenge 처리
  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  // 📩 DM 이벤트 처리
  if (event?.type === 'message' && event.channel_type === 'im' && !event.bot_id) {
    const adminChannel = process.env.ADMIN_CHANNEL_ID;
    const token = process.env.SLACK_BOT_TOKEN;

    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: adminChannel,
          text: `📩 [익명 메시지 도착] ${event.text}`
        })
      });

      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: event.channel,
          text: '의견 감사해요 🙏 익명으로 피플팀에 전달했어요.'
        })
      });

      return res.status(200).send('OK');
    } catch (error) {
      console.error('Slack DM 처리 오류:', error);
      return res.status(500).send('Error forwarding message');
    }
  }

  return res.status(200).send('No action taken');
}
