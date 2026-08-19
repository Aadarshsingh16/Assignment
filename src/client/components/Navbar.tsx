type NavbarProps = {
  onLogoClick: () => void;
};

export function Navbar({ onLogoClick }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="logo-btn" onClick={onLogoClick}>
          <span className="logo-icon">📡</span>
          <div className="logo-text">
            <span className="logo-title">VIBE CHECK</span>
            <span className="logo-sub">Reddit Sentiment Analytics</span>
          </div>
        </button>
      </div>
    </nav>
  );
}
