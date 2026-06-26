import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const htmlPath = join(process.cwd(), 'public', 'app.html');
    const html = readFileSync(htmlPath, 'utf8');
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return new Response('Error loading UI: ' + error.message, { status: 500 });
  }
}
