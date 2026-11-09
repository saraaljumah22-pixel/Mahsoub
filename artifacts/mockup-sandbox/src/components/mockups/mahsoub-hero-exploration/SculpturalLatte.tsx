import './_group.css';
import './SculpturalLatte.css';

export function SculpturalLatte() {
  return (
    <div className="hero-preview sculptural-latte">
      <section className="hero">
        <div className="hero-copy">
          <img className="hero-logo" src="/__mockup/images/mahsoub-logo.jpeg" alt="MAHSOUB | محسوب" />
          <h1 className="hero-tagline">Every Sip Counts.</h1>
          <p className="hero-intro">Your favorite drinks, thoughtfully calculated.</p>
          <a className="button button-cream" href="#menu">
            <span>Explore Our Menu</span><span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-visual">
          <img
            className="hero-fallback"
            src="/__mockup/images/mahsoub-latte.jpg"
            alt="Layered milk and coffee in a clear glass, lit by warm daylight"
          />
        </div>
      </section>
    </div>
  );
}
