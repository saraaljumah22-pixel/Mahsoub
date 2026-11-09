import './_group.css';
import './DaylightPour.css';

export function DaylightPour() {
  return (
    <div className="hero-preview daylight-preview">
      <section className="hero daylight-hero">
        <div className="hero-copy daylight-copy">
          <img className="hero-logo" src="/__mockup/images/mahsoub-logo.jpeg" alt="MAHSOUB | محسوب" />
          <h1 className="hero-tagline">Every Sip Counts.</h1>
          <p className="hero-intro">Your favorite drinks, thoughtfully calculated.</p>
          <a className="button button-cream" href="#menu">
            <span>Explore Our Menu</span><span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-visual daylight-visual">
          <img
            className="daylight-beverage"
            src="/__mockup/images/mahsoub-matcha.jpg"
            alt="Fresh matcha in a glass on cream stone in natural window light"
          />
        </div>
      </section>
    </div>
  );
}
