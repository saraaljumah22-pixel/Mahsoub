import './_group.css';

export function Current() {
  return (
    <div className="hero-preview">
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
          <img className="hero-fallback" src="/__mockup/images/hero-current-poster.jpg" alt="Iced matcha being prepared on a digital kitchen scale" />
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/__mockup/images/hero-current-poster.jpg"
            aria-hidden="true"
            disablePictureInPicture
            disableRemotePlayback
          >
            <source src="/__mockup/images/hero-current.mp4" type="video/mp4" />
          </video>
        </div>
      </section>
    </div>
  );
}
