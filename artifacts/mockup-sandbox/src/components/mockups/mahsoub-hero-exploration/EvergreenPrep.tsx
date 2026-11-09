import './_group.css';
import './EvergreenPrep.css';

export function EvergreenPrep() {
  return (
    <div className="evergreen-prep">
      <section className="hero evergreen-hero">
        <div className="hero-copy evergreen-copy">
          <img className="hero-logo" src="/__mockup/images/mahsoub-logo.jpeg" alt="MAHSOUB | محسوب" />
          <h1 className="hero-tagline">Every Sip Counts.</h1>
          <p className="hero-intro">Your favorite drinks, thoughtfully calculated.</p>
          <a className="button button-cream" href="#menu">
            <span>Explore Our Menu</span><span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-visual evergreen-visual">
          <img
            className="hero-fallback evergreen-image"
            src="/__mockup/images/mahsoub-americano.jpg"
            alt="A warm Americano in a clear glass, set against softly lit stone and olive leaves"
          />
        </div>
      </section>
    </div>
  );
}
