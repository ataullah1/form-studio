export default function LoginPage() {
  return <section className="admin-card"><p className="eyebrow">Owner access</p><h1>Studio inbox</h1><p>Sign in with your allowed Google account to review private demo enquiries.</p><form action="/api/admin/auth/google" method="post"><button className="primary-button" type="submit">Continue with Google</button></form><p>Access is restricted by the owner. Public demo visitors cannot open this inbox.</p></section>;
}
