const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Setup logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('NETWORK FAILED:', response.url(), response.status());
    }
  });

  try {
    console.log('Navigating to https://raghhav-roadways.vercel.app/...');
    await page.goto('https://raghhav-roadways.vercel.app/', { waitUntil: 'networkidle2' });

    // Wait for username input
    console.log('Typing username and password...');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.type('input[name="username"]', 'admin1');
    
    // Wait for password input (assuming name="password" or type="password")
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', 'admin123');

    // Click login button (assuming a button of type submit or text "Sign In" / "Login")
    console.log('Clicking login...');
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      console.log('Could not find login button by text, submitting form...');
      await page.keyboard.press('Enter');
    }

    console.log('Waiting for navigation after login...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Current URL:', page.url());

    console.log('Navigating to /invoices...');
    await page.goto('https://raghhav-roadways.vercel.app/invoices', { waitUntil: 'networkidle2' });
    
    console.log('Current URL after navigating to invoices:', page.url());
    
    // Take a screenshot
    const screenshotPath = '/Users/msagastya/.gemini/antigravity/brain/a38c0f2a-76ea-485c-862f-7305a5779247/scratch/invoices_debug.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

  } catch (error) {
    console.error('Script Error:', error);
  } finally {
    await browser.close();
  }
}

run();
