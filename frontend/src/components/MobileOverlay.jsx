export default function MobileOverlay() {
  return (
    <div className="mobile-overlay">
      <div className="mobile-overlay__backdrop" />

      {/* Animated grid lines */}
      <div className="mobile-overlay__grid" />

      {/* Glowing orbs */}
      <div className="mobile-overlay__orb mobile-overlay__orb--1" />
      <div className="mobile-overlay__orb mobile-overlay__orb--2" />

      {/* Card */}
      <div className="mobile-overlay__card">
        {/* Icon */}
        <div className="mobile-overlay__icon-wrap">
          <svg
            className="mobile-overlay__icon"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Monitor */}
            <rect x="4" y="8" width="40" height="26" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <line x1="16" y1="40" x2="32" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="34" x2="24" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            {/* X on screen */}
            <line x1="18" y1="17" x2="30" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="17" x2="18" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Phone silhouette small */}
            <rect x="33" y="26" width="10" height="16" rx="1.5" fill="currentColor" opacity="0.18" />
            <rect x="34" y="29" width="8" height="10" rx="0.5" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        <h1 className="mobile-overlay__title">Desktop Only</h1>

        <p className="mobile-overlay__subtitle">
          This application is designed for large screens.<br />
          Please open it on a <span className="mobile-overlay__highlight">desktop or laptop</span> for the full experience.
        </p>

        <div className="mobile-overlay__divider" />

        <p className="mobile-overlay__hint">
          Recommended minimum screen width: <strong>1024 px</strong>
        </p>
      </div>

      <style>{`
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 9999;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #070b14;
        }

        @media (max-width: 1023px) {
          .mobile-overlay {
            display: flex;
          }
        }

        /* ── backdrop gradient ── */
        .mobile-overlay__backdrop {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,211,238,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 100%, rgba(8,145,178,0.08) 0%, transparent 60%);
        }

        /* ── subtle grid ── */
        .mobile-overlay__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(30,45,69,0.55) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,45,69,0.55) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── glowing orbs ── */
        .mobile-overlay__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: mob-orb-pulse 5s ease-in-out infinite alternate;
        }
        .mobile-overlay__orb--1 {
          width: 300px; height: 300px;
          background: rgba(34,211,238,0.12);
          top: -80px; left: -60px;
        }
        .mobile-overlay__orb--2 {
          width: 260px; height: 260px;
          background: rgba(8,145,178,0.10);
          bottom: -60px; right: -40px;
          animation-delay: 2.5s;
        }

        @keyframes mob-orb-pulse {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.15); }
        }

        /* ── card ── */
        .mobile-overlay__card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2.5rem 2rem;
          margin: 1.5rem;
          max-width: 420px;
          width: 100%;
          background: rgba(13,20,36,0.85);
          border: 1px solid rgba(34,211,238,0.18);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(34,211,238,0.06),
            0 24px 64px rgba(0,0,0,0.6),
            0 0 60px rgba(34,211,238,0.07) inset;
          animation: mob-card-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes mob-card-in {
          from { opacity: 0; transform: translateY(30px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        /* ── icon ── */
        .mobile-overlay__icon-wrap {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(34,211,238,0.08);
          border: 1px solid rgba(34,211,238,0.20);
          margin-bottom: 1.5rem;
          box-shadow: 0 0 30px rgba(34,211,238,0.12);
          animation: mob-icon-glow 3s ease-in-out infinite alternate;
        }

        @keyframes mob-icon-glow {
          from { box-shadow: 0 0 20px rgba(34,211,238,0.10); }
          to   { box-shadow: 0 0 40px rgba(34,211,238,0.28); }
        }

        .mobile-overlay__icon {
          width: 44px;
          height: 44px;
          color: #22d3ee;
        }

        /* ── text ── */
        .mobile-overlay__title {
          font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #e2e8f0;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #e2e8f0 30%, #22d3ee 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-overlay__subtitle {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 0.95rem;
          line-height: 1.65;
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }

        .mobile-overlay__highlight {
          color: #22d3ee;
          font-weight: 600;
        }

        .mobile-overlay__divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.20), transparent);
          margin-bottom: 1.25rem;
        }

        .mobile-overlay__hint {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 0.78rem;
          color: #475569;
        }

        .mobile-overlay__hint strong {
          color: #64748b;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
