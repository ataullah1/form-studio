import Link from 'next/link';
export default function SharedNotFound() {
  return <main className="configure"><h1>Shared design not found.</h1><p>This link may be incorrect or no longer available.</p><Link className="text-link" href="/configure">Build your desk</Link></main>;
}
