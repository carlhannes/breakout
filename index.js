const { chromium } = require('playwright');
const fetch = require('isomorphic-unfetch');
const fs = require('fs').promises;
const YAML = require('yaml');

// check if we can reach captive.apple.com
// if we can, DNS and internet is working
const checkCaptivePortal = async () => {
  const res = await fetch('http://captive.apple.com');
  return res.status === 200;
};

// get config.yml if it exists
const getConfig = async () => {
  try {
    const file = await fs.readFile('config.yml', 'utf8');
    return YAML.parse(file);
  } catch (err) {
    return null;
  }
};

const objectToUpperCase = async (obj) => Object.keys(obj).reduce((accumulator, key) => {
  accumulator[key.toUpperCase()] = obj[key];
  return accumulator;
}, {});

// main program
const rebootDevice = async ({
  browser,
  TARGET,
  USERNAME,
  PASSWORD,
  DRYRUN = false,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(TARGET || 'http://192.168.1.1/');

  // get first applicable username field
  const usernameFld = await Promise.any([
    page.getByPlaceholder('User', { timeout: 1000 }),
    page.getByPlaceholder('Username', { timeout: 1000 }),
    page.getByText('Username', { timeout: 1000 }),
    page.getByLabel('Username', { timeout: 1000 }),
    page.getByPlaceholder('User name', { timeout: 1000 }),
    page.getByText('User name', { timeout: 1000 }),
    page.getByLabel('User name', { timeout: 1000 }),
    page.locator('input[name="username"]', { timeout: 1000 }),
    page.locator('input[name="password"]', { timeout: 1000 }),
  ]).catch(() => {
    console.log('No username field found');
  });
  if (usernameFld) {
    await usernameFld.fill(USERNAME || 'admin');
  }

  // get the first applicable password field
  const passwordFld = await Promise.any([
    page.getByPlaceholder('Password', { timeout: 1000 }),
    page.getByText('Password', { timeout: 1000 }),
    page.getByLabel('Password', { timeout: 1000 }),
    page.locator('input[type="password"]', { timeout: 1000 }),
    page.locator('input[name="password"]', { timeout: 1000 }),
  ]).catch(() => {
    throw new Error('No password field found');
  });

  await passwordFld.fill(PASSWORD || 'password');
  await passwordFld.press('Enter');

  page.once('dialog', async (dialog) => {
    console.log(dialog.message());
    await dialog.accept();
  });

  // ugly solution for telia-routers
  // needs refactoring in the future :)
  const isTeliaRouter = await page.$$('.brandlogin').then((res) => res.length > 0);
  if (isTeliaRouter) {
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    await page.locator('.row >> text="Router"').click();
    await page.locator('.tabs >> text="Maintenance"').click();
    await page.locator('.button >> text="Restart"').click();

    const rebootBtn = await page.locator('.button >> text="Reboot"');

    if (!DRYRUN) {
      await rebootBtn.click();
    } else {
      console.log('DRYRUN: Reboot button found!', rebootBtn);
    }
  } else {
    // get the first applicable reboot button

    const rebootBtn = await Promise.any([
      page.getByText('Reboot', { timeout: 1000 }),
      page.getByText('Reboot Router', { timeout: 1000 }),
      page.getByText('Reboot Device', { timeout: 1000 }),
      page.getByText('Reboot Modem', { timeout: 1000 }),
      page.getByText('Reboot Gateway', { timeout: 1000 }),
      page.locator(':has-text("Reboot")', { timeout: 1000 }),
    ]).catch(() => {
      throw new Error('No reboot button found');
    });

    if (!DRYRUN) {
      await rebootBtn.click();
    } else {
      console.log('DRYRUN: Reboot button found!', rebootBtn);
    }
  }

  await context.close();
};

// ---------------------

// main program
(async () => {
  let CONFIG = await getConfig();
  if (CONFIG && process.env) {
    CONFIG = {
      ...objectToUpperCase(process.env),
      ...objectToUpperCase(CONFIG),
    };
  }

  const internetIsReachable = await checkCaptivePortal();
  if (!internetIsReachable || CONFIG.IGNORE_CHECK) {
    console.log('Internet is not reachable, rebooting device(s)');

    const browser = await chromium.launch({
      headless: CONFIG.NODE_ENV !== 'development',
    });

    await rebootDevice({ browser, ...CONFIG });

    await browser.close();
  } else {
    console.log('Internet is reachable!');
  }
})();
