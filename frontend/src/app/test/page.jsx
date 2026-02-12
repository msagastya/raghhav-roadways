export default function TestPage() {
  return (
    <div style={{ padding: '40px', fontSize: '24px', color: 'black', backgroundColor: 'yellow' }}>
      <h1>✅ ROUTING IS WORKING!</h1>
      <p>If you see this yellow page with black text, the routing is fine.</p>
      <p>The login page component has a rendering issue.</p>
      <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
        Click here to go to login page
      </a>
    </div>
  );
}
