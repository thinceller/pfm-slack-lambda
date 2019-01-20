const delay = require('delay');
const puppeteer = require('puppeteer');

const pfmSigninUrl = 'https://moneyforward.com/users/sign_in';
const email = process.env.EMAIL
const password = process.env.PASSWORD

/**
 * handler
 *
 * @param {*} event
 * @param {*} context
 */
exports.handler = async (event, context) => {
  const browser = await puppeteer.launch({
    headless: true,
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
  ])

  const title = await page.evaluate(() => {
    return document.querySelector('title').textContent
  })
  await delay(1000);
  console.log(title);
  await delay(1000);

  // 終了処理
  await page.close();
  await browser.close();
}
