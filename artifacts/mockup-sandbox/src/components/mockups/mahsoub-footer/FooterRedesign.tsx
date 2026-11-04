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

export function FooterRedesign() {
  return (
    <div className="footer-preview">
      <footer className="site-footer footer-refresh">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="footer-brand" href="#home" aria-label="MAHSOUB home">
              <img src="/__mockup/images/mahsoub-logo.jpeg" alt="" />
              <span>MAHSOUB</span>
            </a>
            <p className="footer-caption">Every Sip Counts.</p>
          </div>

          <nav className="footer-navigation" aria-label="Footer navigation">
            <h2 className="footer-section-title">Explore</h2>
            <ul>
              <li><button type="button">About Us</button></li>
              <li><button type="button">Menu</button></li>
              <li><button type="button">Contact</button></li>
            </ul>
          </nav>

          <section className="footer-social" aria-labelledby="footer-social-title">
            <h2 className="footer-section-title" id="footer-social-title">Follow our journey</h2>
            <a
              className="footer-social-link"
              href="https://www.instagram.com/ma7sob.kw/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram, @ma7sob.kw"
            >
              <InstagramIcon />
              <span>@ma7sob.kw</span>
              <span className="footer-arrow" aria-hidden="true">↗</span>
            </a>
          </section>
        </div>
        <div className="footer-bottom">© MAHSOUB</div>
      </footer>
    </div>
  );
}
