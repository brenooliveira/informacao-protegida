export function SecurityVisual() {
  return (
    <div
      className="security-visual"
      role="img"
      aria-label="Ilustração de um escudo verde conectado a camadas de privacidade. Não representa uma verificação real."
    >
      <div className="visual-grid" />
      <div className="orbit orbit-outer" />
      <div className="orbit orbit-middle" />
      <div className="orbit orbit-inner" />
      <div className="crosshair crosshair-h" />
      <div className="crosshair crosshair-v" />
      <span className="orbit-node node-one" />
      <span className="orbit-node node-two" />
      <span className="orbit-node node-three" />
      <div className="visual-label label-top">
        <span className="status-dot" /> PRIVACIDADE POR PRINCÍPIO
      </div>
      <div className="visual-coordinate coordinate-top">
        LOCAL / DEV
        <br />
        PRÉVIA / 01
      </div>
      <svg
        className="hero-shield"
        viewBox="0 0 220 260"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="shield-fill" x1="0" y1="0" x2="220" y2="260">
            <stop stopColor="#9afa4c" stopOpacity=".18" />
            <stop offset="1" stopColor="#9afa4c" stopOpacity=".015" />
          </linearGradient>
          <linearGradient id="shield-line" x1="0" y1="0" x2="220" y2="260">
            <stop stopColor="#d3ffa2" />
            <stop offset="1" stopColor="#427b28" />
          </linearGradient>
        </defs>
        <path
          d="M110 9 202 47v75c0 61-36 99-92 128-56-29-92-67-92-128V47Z"
          fill="url(#shield-fill)"
          stroke="url(#shield-line)"
          strokeWidth="1.5"
        />
        <path
          d="m110 27 76 31v64c0 50-28 84-76 110-48-26-76-60-76-110V58Z"
          stroke="#9afa4c"
          strokeOpacity=".18"
        />
        <path
          d="m76 126 24 25 49-59"
          stroke="#aeff67"
          strokeWidth="5"
          strokeLinecap="square"
        />
        <path
          d="M110 9v32M18 122h24m136 0h24M110 218v32"
          stroke="#baff81"
          strokeWidth="2"
        />
      </svg>
      <div className="visual-tag">
        <span className="tag-symbol">⌘</span>
        <div>
          Seus dados.
          <br />
          <strong>Seu controle.</strong>
        </div>
        <span className="tag-corner">↗</span>
      </div>
      <div className="visual-label label-bottom">
        01 / CONHECER → ENTENDER → AGIR
      </div>
    </div>
  );
}
