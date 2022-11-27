const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: process.env.NODE_ENV !== 'development',
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(process.env.TARGET || 'http://192.168.1.1/');

  // get first applicable username field
  const username = await Promise.any([
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

  if (username) {
    await username.fill(process.env.USERNAME || 'admin');
  }

  // get the first applicable password field
  const password = await Promise.any([
    page.getByPlaceholder('Password', { timeout: 1000 }),
    page.getByText('Password', { timeout: 1000 }),
    page.getByLabel('Password', { timeout: 1000 }),
    page.locator('input[type="password"]', { timeout: 1000 }),
    page.locator('input[name="password"]', { timeout: 1000 })
  ]).catch(() => {
    throw new Error('No password field found');
  });


  await password.fill(process.env.PASSWORD || 'password');
  await password.press('Enter');

  
  page.once('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.accept();
  });

  // get the first applicable reboot button
  const reboot = await Promise.any([
    page.getByText('Reboot', { timeout: 1000 }),
    page.getByText('Reboot Router', { timeout: 1000 }),
    page.getByText('Reboot Device', { timeout: 1000 }),
    page.getByText('Reboot Modem', { timeout: 1000 }),
    page.getByText('Reboot Gateway', { timeout: 1000 }),
    page.locator(':has-text("Reboot")', { timeout: 1000 })
  ]).catch(() => {
    throw new Error('No reboot button found');
  });

  await reboot.click();

  // ---------------------
  await context.close();
  await browser.close();
})();