const { IncomingWebhook } = require('@slack/client');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

/**
 * send message to slack
 *
 * @param {Object} args
 */
exports.postMessage = async (args) => {
  await webhook.send(args)
}
