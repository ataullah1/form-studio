import { ImageResponse } from 'next/og';
export const alt = 'Form Studio — Studio Desk 01, an independent furniture configurator concept';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// A lightweight code-rendered social card; no external image/model/font request.
export default function SocialPreview() {
  return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: '#f4ede3', color: '#2b211c', padding: 64, flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 23, letterSpacing: 3 }}><span>FORM STUDIO</span><span>STUDIO DESK 01</span></div>
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 86, lineHeight: 1.05, letterSpacing: -4 }}><span>Your desk.</span><span style={{ color: '#a3442d' }}>Built around you.</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid #bba696', fontSize: 23 }}><span>Size. Finish. Accessories. Explore in 3D.</span><span>Independent concept</span></div>
  </div>, size);
}
