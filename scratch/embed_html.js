const fs = require('fs');
const html = fs.readFileSync('frontend/public/app.html', 'utf8');
const escapedHtml = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
const code = `export async function GET() {
  return new Response(\`${escapedHtml}\`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  });
}`;
fs.writeFileSync('frontend/src/app/v2/route.js', code);
console.log('Embedded app.html into route.js');
