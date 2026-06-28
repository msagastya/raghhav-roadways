const puppeteer = require('/Users/msagastya/Desktop/Projects/raghhav-roadways/backend/node_modules/puppeteer-core');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });
  page.on('response', response => {
    if (!response.ok()) {
      console.log('RESPONSE FAILED:', response.url(), response.status());
    }
  });

  console.log('Navigating to Vercel login page...');
  await page.goto('https://raghhav-roadways.vercel.app/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/msagastya/.gemini/antigravity/brain/a38c0f2a-76ea-485c-862f-7305a5779247/scratch/vercel_login_loaded.png' });
  
  console.log('Filling in credentials...');
  // The login form uses input[name="username"] and input[name="password"]
  await page.type('input[name="username"]', 'ms.rudra.agastya@gmail.com');
  await page.type('input[name="password"]', 'password123');
  
  console.log('Clicking sign in...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for navigation...');
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
    console.log('Navigation wait timed out or failed:', e.message);
  }
  
  console.log('Current URL:', page.url());
  await page.screenshot({ path: '/Users/msagastya/.gemini/antigravity/brain/a38c0f2a-76ea-485c-862f-7305a5779247/scratch/vercel_after_login.png' });
  
  // Wait a bit more and see if there are dynamic loads
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: '/Users/msagastya/.gemini/antigravity/brain/a38c0f2a-76ea-485c-862f-7305a5779247/scratch/vercel_after_login_delay.png' });
  console.log('Final URL:', page.url());

  await browser.close();
}

run().catch(console.error);
