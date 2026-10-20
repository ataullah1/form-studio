export default function LoginPage() {
  return <section className="admin-card"><p className="eyebrow">Owner access</p><h1>Studio inbox</h1><p>Sign in with Google. Allowed owners can open the private inbox; other accounts continue to their own dashboard.</p><form action="/api/admin/auth/google" method="post"><button className="primary-button" type="submit">Continue with Google</button></form><p>The admin inbox remains restricted by the owner. Everyone can use their own dashboard.</p></section>;
}
