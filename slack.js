const { IncomingWebhook } = require('@slack/client');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

/**
 * send message to slack
 *
 * @param {string} text main text
 */
exports.postMessage = async (text) => {
  const payload = {
    text,
    username: 'MF デイリー通知bot',
  };

  await webhook.send(payload).then(res => {
    console.log(`送信成功: ${res}`);
  }).catch(err => {
    console.log(`送信失敗: ${err}`);
  });
}
