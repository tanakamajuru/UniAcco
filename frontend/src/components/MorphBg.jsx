import { useEffect, useState } from 'react';

// Brand blue + gold morphing gradient blobs that gently drift and react to the
// mouse. Rendered once, fixed behind all page content (see App.jsx).
const BLOBS = [
  { top: '-10%', left: '-6%', size: 560, color: '#4DB6E2', alpha: '59', blur: 90, anim: 'blobDriftA 16s ease-in-out infinite', strength: 55 },
  { bottom: '-14%', right: '-4%', size: 540, color: '#F4C430', alpha: '4D', blur: 90, anim: 'blobDriftB 13s ease-in-out infinite', strength: 40 },
  { top: '28%', right: '12%', size: 420, color: '#2F8FB8', alpha: '4D', blur: 80, anim: 'blobDriftC 22s linear infinite', strength: 70 },
  { bottom: '10%', left: '18%', size: 320, color: '#4DB6E2', alpha: '40', blur: 70, anim: 'blobDriftB 18s ease-in-out infinite', strength: 30 },
];

export default function MorphBg() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) =>
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{ top: b.top, left: b.left, right: b.right, bottom: b.bottom, width: b.size, height: b.size, animation: b.anim }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${b.color}${b.alpha} 0%, transparent 65%)`,
              filter: `blur(${b.blur}px)`,
              transform: `translate(${mouse.x * b.strength}px, ${mouse.y * b.strength}px)`,
              transition: 'transform .35s cubic-bezier(.22,.61,.36,1)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
