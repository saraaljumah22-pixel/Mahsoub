import './_group.css';

function InstagramIcon() {
  return (
    <svg className="instagram-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Current() {
  return (
    <div className="footer-preview">
      <footer className="site-footer">
        <a className="footer-brand" href="#home">
          <img src="/__mockup/images/mahsoub-logo.jpeg" alt="" />
          <span>MAHSOUB</span>
        </a>
        <span className="footer-caption">Every Sip Counts.</span>
        <div className="footer-links">
          <button type="button">About Us</button>
          <button type="button">Menu</button>
          <button type="button">Contact</button>
          <a href="https://www.instagram.com/ma7sob.kw/" target="_blank" rel="noreferrer">
            <InstagramIcon />
            <span>Instagram · @ma7sob.kw</span> ↗
          </a>
        </div>
        <span className="copyright">© MAHSOUB</span>
      </footer>
    </div>
  );
}
