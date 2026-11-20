import React, { useState } from 'react';
import { CategoryInfo } from '../types/editorial';

interface EditorialVisualProps {
  motif: CategoryInfo['visualMotif'];
  imageUrl?: string;
  alt: string;
  aspectClass?: string;
  priority?: boolean;
}

export const EditorialVisual: React.FC<EditorialVisualProps> = ({
  motif,
  imageUrl,
  alt,
  aspectClass = 'aspect-[16/10]',
  priority = false,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imageUrl && !imgFailed) {
    return (
      <div className={`relative w-full overflow-hidden bg-navy-900 ${aspectClass}`}>
        <img
          src={imageUrl}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative w-full overflow-hidden bg-[#0b1324] ${aspectClass}`}
    >
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`bg-${motif}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#060b16" />
            <stop offset="55%" stopColor="#0f1b33" />
            <stop offset="100%" stopColor="#162748" />
          </linearGradient>
          <linearGradient id={`accent-${motif}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
          </linearGradient>
          <pattern id={`grid-${motif}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="500" fill={`url(#bg-${motif})`} />
        <rect width="800" height="500" fill={`url(#grid-${motif})`} />

        {motif === 'network' && (
          <g>
            <circle cx="620" cy="140" r="190" fill="rgba(37,99,235,0.12)" />
            <path
              d="M120 380 L260 220 L430 280 L580 140 L700 180"
              fill="none"
              stroke={`url(#accent-${motif})`}
              strokeWidth="2.5"
            />
            <path
              d="M120 300 L260 220 L390 150 L580 140"
              fill="none"
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1.5"
            />
            {[
              [120, 380],
              [260, 220],
              [430, 280],
              [580, 140],
              [700, 180],
              [390, 150],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="9" fill="#0b1324" stroke="#3b82f6" strokeWidth="2.5" />
                <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
              </g>
            ))}
            <rect x="80" y="90" width="180" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
            <rect x="80" y="112" width="120" height="6" rx="3" fill="rgba(59,130,246,0.45)" />
          </g>
        )}

        {motif === 'meridian' && (
          <g>
            <circle cx="480" cy="260" r="175" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
            <ellipse cx="480" cy="260" rx="95" ry="175" fill="none" stroke="rgba(59,130,246,0.45)" strokeWidth="1.5" />
            <ellipse cx="480" cy="260" rx="175" ry="62" fill="none" stroke="rgba(148,163,184,0.28)" strokeWidth="1.5" />
            <line x1="120" y1="260" x2="720" y2="260" stroke="rgba(59,130,246,0.6)" strokeWidth="1.5" />
            <path d="M160 360 Q 380 180 680 190" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 6" />
            <circle cx="680" cy="190" r="6" fill="#ffffff" />
            <circle cx="160" cy="360" r="6" fill="#3b82f6" />
          </g>
        )}

        {motif === 'ledger' && (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = 140 + i * 92;
              const h = 90 + ((i * 53) % 190);
              return (
                <rect
                  key={i}
                  x={x}
                  y={400 - h}
                  width="54"
                  height={h}
                  rx="4"
                  fill={i === 4 ? '#2563eb' : 'rgba(148,163,184,0.18)'}
                  stroke={i === 4 ? '#60a5fa' : 'rgba(148,163,184,0.28)'}
                  strokeWidth="1"
                />
              );
            })}
            <path
              d="M140 310 L260 270 L380 285 L500 175 L640 120"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <circle cx="640" cy="120" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}

        {motif === 'orbit' && (
          <g>
            <circle cx="400" cy="250" r="46" fill="#1d4ed8" opacity="0.85" />
            <circle cx="400" cy="250" r="46" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
            <ellipse
              cx="400"
              cy="250"
              rx="230"
              ry="78"
              transform="rotate(-18 400 250)"
              fill="none"
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1.5"
            />
            <ellipse
              cx="400"
              cy="250"
              rx="300"
              ry="118"
              transform="rotate(14 400 250)"
              fill="none"
              stroke="rgba(59,130,246,0.55)"
              strokeWidth="1.75"
            />
            <circle cx="612" cy="182" r="8" fill="#ffffff" />
            <circle cx="196" cy="288" r="6" fill="#60a5fa" />
            <circle cx="140" cy="110" r="2" fill="rgba(255,255,255,0.7)" />
            <circle cx="680" cy="100" r="2" fill="rgba(255,255,255,0.6)" />
            <circle cx="640" cy="390" r="2.5" fill="rgba(255,255,255,0.5)" />
          </g>
        )}

        {motif === 'aperture' && (
          <g>
            <rect x="160" y="105" width="480" height="290" rx="8" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
            <rect x="210" y="140" width="380" height="220" rx="4" fill="rgba(37,99,235,0.12)" stroke="rgba(59,130,246,0.55)" strokeWidth="1.5" />
            <circle cx="400" cy="250" r="68" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
            <polygon points="384,224 432,250 384,276" fill="#3b82f6" />
            <line x1="160" y1="425" x2="640" y2="425" stroke="rgba(148,163,184,0.3)" strokeWidth="2" />
            <line x1="160" y1="425" x2="430" y2="425" stroke="#3b82f6" strokeWidth="3" />
          </g>
        )}

        {motif === 'pavilion' && (
          <g>
            <rect x="150" y="150" width="500" height="240" fill="none" stroke="rgba(148,163,184,0.32)" strokeWidth="1.5" />
            <line x1="150" y1="210" x2="650" y2="210" stroke="rgba(59,130,246,0.45)" strokeWidth="1.5" />
            <line x1="275" y1="150" x2="275" y2="390" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
            <line x1="400" y1="150" x2="400" y2="390" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
            <line x1="525" y1="150" x2="525" y2="390" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
            <polygon points="150,150 400,90 650,150" fill="rgba(37,99,235,0.16)" stroke="#60a5fa" strokeWidth="1.5" />
            <rect x="355" y="295" width="90" height="95" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
          </g>
        )}
      </svg>
    </div>
  );
};
