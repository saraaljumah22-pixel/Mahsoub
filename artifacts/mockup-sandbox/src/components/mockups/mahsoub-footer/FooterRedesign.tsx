import './_group.css';
import './_compact.css';

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
      <footer className="site-footer footer-redesign">
        <div className="footer-inner">
          <div className="footer-brand-block">
            <a className="footer-brand" href="#home" aria-label="MAHSOUB home">
              <img src="/__mockup/images/mahsoub-logo.jpeg" alt="" />
              <span>MAHSOUB</span>
            </a>
            <p className="footer-caption">Every Sip Counts.</p>
          </div>

          <nav className="footer-navigation" aria-label="Footer navigation">
            <ul>
              <li><button type="button">About Us</button></li>
              <li><button type="button">Menu</button></li>
              <li><button type="button">Contact</button></li>
            </ul>
          </nav>

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
          <span className="copyright">© MAHSOUB</span>
        </div>
      </footer>
    </div>
  );
}
