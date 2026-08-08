"use client";

type Props = {
  playKey: number;
};

export default function LogoFormation({ playKey }: Props) {
  return (
    <div key={playKey} className="logo-formation" aria-hidden="true">
      <div className="logo-formation__halo logo-formation__halo--one" />
      <div className="logo-formation__halo logo-formation__halo--two" />
      <div className="logo-formation__mark">
        <img src="/logo.png" alt="" />
      </div>
      <style jsx>{`
        .logo-formation {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          pointer-events: none;
          background: rgba(0, 0, 0, 0.96);
          animation: formation-exit 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .logo-formation__mark {
          position: relative;
          z-index: 3;
          width: clamp(76px, 18vw, 118px);
          height: clamp(76px, 18vw, 118px);
          display: grid;
          place-items: center;
          animation: mark-form 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: translate3d(0, 9px, 0) scale(0.62);
          opacity: 0;
          will-change: transform, opacity;
        }

        .logo-formation__mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: auto;
        }

        .logo-formation__halo {
          position: absolute;
          width: clamp(112px, 27vw, 172px);
          height: clamp(112px, 27vw, 172px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          transform: scale(0.45);
          opacity: 0;
          will-change: transform, opacity;
        }

        .logo-formation__halo--one {
          animation: halo-form 560ms cubic-bezier(0.16, 1, 0.3, 1) 30ms forwards;
        }

        .logo-formation__halo--two {
          width: clamp(154px, 37vw, 232px);
          height: clamp(154px, 37vw, 232px);
          border-color: rgba(255, 255, 255, 0.055);
          animation: halo-form 620ms cubic-bezier(0.16, 1, 0.3, 1) 50ms forwards;
        }

        @keyframes mark-form {
          0% { transform: translate3d(0, 9px, 0) scale(0.62); opacity: 0; }
          55% { transform: translate3d(0, -1px, 0) scale(1.04); opacity: 1; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }

        @keyframes halo-form {
          0% { transform: scale(0.45); opacity: 0; }
          55% { transform: scale(1.04); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.28; }
        }

        @keyframes formation-exit {
          0%, 72% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-formation,
          .logo-formation__mark,
          .logo-formation__halo--one,
          .logo-formation__halo--two {
            animation-duration: 1ms;
          }
        }
      `}</style>
    </div>
  );
}
