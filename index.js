const delay = require('delay');
const moment = require('moment');
const puppeteer = require('puppeteer');

const client = require('./slack');

const pfmSigninUrl = 'https://moneyforward.com/users/sign_in';
const email = process.env.EMAIL
const password = process.env.PASSWORD
const name = process.env.YOUR_NAME

exports.handler = async (event, context) => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/opt/headless-chromium',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-gpu', '--single-process', '--lang=ja,en-US,en']
  });
  const page = await browser.newPage();

  // サインイン
  await page.goto(pfmSigninUrl, { waitUntil: 'domcontentloaded' });
  await delay(1000);
  await page.type('#sign_in_session_service_email', email);
  await page.type('#sign_in_session_service_password', password);
  await delay(1000);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('#login-btn-sumit')
  ]);

  await delay(1000);

  // 情報取得
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('a[href="/cf"')
  ]);
  await page.click('#in_out button.fc-button-today');

  const dateList = [];
  const today = moment();
  // 先週一週間の日付リストを作成
  for (let i = 0; i < 7; i++) {
    dateList.push(today.add(-1, 'days').format('YYYY/MM/DD'));
  }

  const data = await page.evaluate(dateList => {
    let data = {};
    const trList = document.querySelectorAll('tr.transaction_list');
    trList.forEach(node => {
      const date = node.children[1].dataset.tableSortableValue;
      if (!dateList.some(targetDate => date.match(targetDate))) return;
      const amount = Number(node.children[3].querySelector('span').textContent.trim().replace(',', ''));
      // 収入ならスキップ
      if (Math.sign(amount) === 1) return;
      const category = node.children[5].textContent.trim();
      // 項目なしは振替なのでスキップ
      if (!category) { return; }
      data[category] = data[category] || 0;
      data[category] += amount;
    });
    return data;
  }, dateList);

  // Slack通知送信
  const message = createSlackMessage(data, name);
  await client.postMessage(message);
  await delay(1000);

  // 終了処理
  await page.close();
  await browser.close();
}

/**
 * スクレイピングした結果を受け取って通知用のメッセージを作成する
 *
 * @param {Object} data スクレイピング結果
 * @param {string} name あなたの名前
 * @returns {string} Slack送信用メッセージ
 */
const createSlackMessage = (data, name) => {
  // dataがからの場合は別のメッセージを返す
  if (!Object.keys(data).length) {
    return `
${name}さん、今週もお疲れ様でした！
今週の出費はありませんでした。
`
  }

  let cost = '';
  for (let key in data) {
    cost += `
${key}: ${data[key] * -1}円
`
  }
  const message = `
${name}さん、今週もお疲れ様でした！
今週の出費は以下の通りです⬇️

${cost}
詳細はアプリからご確認ください🙌
  `
  return message
}
