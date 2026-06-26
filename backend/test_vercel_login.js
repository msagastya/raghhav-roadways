const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Capture failed network requests
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/v1/auth/login')) {
      console.log(`LOGIN RESPONSE: ${response.status()} ${response.statusText()}`);
    }
  });

  console.log('Navigating to Vercel login page...');
  await page.goto('https://raghhav-roadways.vercel.app/login', { waitUntil: 'networkidle2' });
  
  console.log('Filling in credentials...');
  await page.type('input[type="email"]', 'ms.rudra.agastya@gmail.com');
  await page.type('input[type="password"]', 'password123');
  
  console.log('Clicking login...');
  // Find the submit button and click it
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(b => b.textContent.toLowerCase().includes('authenticate') || b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  // Wait for 5 seconds to see what happens
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Test complete. Closing browser.');
  await browser.close();
})();
