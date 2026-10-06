import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyQuotes from "./MyQuotes";
import familyHero from "./assets/family-hero.png";
import logo from "./assets/logo.png";
import watermarkLogo from "./assets/watermark-logo.png";
import calculatorIcon from "./assets/calculator.png";
import cashIcon from "./assets/cash.png";
import GetAQuote from "./GetAQuote.jsx";
import QuoteResult from "./QuoteResult.jsx";

import clipboardIcon from "./assets/clipboard.png";
import coverIcon from "./assets/cover.png";
import eyeIcon from "./assets/eye.png";
import safeIcon from "./assets/save.png";


const features = [
  {
    icon: calculatorIcon,
    title: "Quick & Easy Estimates",
    text: "Get an instant estimate based on clear pricing rules.",
  },
  {
    icon: safeIcon,
    title: "Compare Cover Options",
    text: "See hospital and extras cover options side by side.",
  },
  {
    icon: cashIcon,
    title: "Save and Manage",
    text: "Keep, edit, and compare your quotes anytime.",
  },
];

const steps = [
{
  number: "01.",
  icon: clipboardIcon,
  title: "Enter Your Details",
  description:
    "Enter your name, cover type, age and hospital cover history.",
},
  {
    number: "02.",
    icon: coverIcon,
    title: "Choose Your Cover Options",
    description:
      "Select your hospital and extras cover levels from the available options.",
  },
  {
    number: "03.",
    icon: eyeIcon,
    title: "View Your Estimate",
    description:
      "Choose Monthly or Yearly and see how your estimated premium is calculated.",
  },
  {
    number: "04.",
    icon: safeIcon,
    title: "Save and Manage",
    description:
      "Save your quote so you can view, edit, update or delete it later.",
  },
];

function HealthCoverLogo() {
  return (
    <div className="brand">
      <img
        className="brand-mark-image"
        src={logo}
        alt=""
      />

      <div className="brand-copy">
        <strong>
          HealthCover<span>Sim</span>
        </strong>

        <small>INSURANCE</small>
      </div>
    </div>
  );
}

function Arrow() {
  return <span className="arrow">→</span>;
}

function FeatureIcon({ src, alt }) {
  return (
    <div className="feature-icon">
      <img src={src} alt={alt} />
    </div>
  );
}



function HomePage() {
  const activateStep = (event) => {
    const board = event.currentTarget.parentElement;

    board
      .querySelectorAll(".step-card")
      .forEach((card) => {
        card.classList.remove("is-active");
        card.setAttribute("aria-expanded", "false");
      });

    event.currentTarget.classList.add("is-active");
    event.currentTarget.setAttribute("aria-expanded", "true");
  };

  const handleStepHover = (event) => {
    if (
      window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches
    ) {
      activateStep(event);
    }
  };

  return (
    <div className="page">

      {/* ================= HEADER ================= */}

      <header className="site-header">

        {/* Logo */}
        <a
          className="logo-link"
          href="#home"
          aria-label="HealthCoverSim home"
        >
          <HealthCoverLogo />
        </a>

        {/* Centered navigation */}
        <nav
          className="nav"
          aria-label="Main navigation"
        >
          <a
            className="active"
            href="#home"
          >
            Home
          </a>

          <a href="/quote">
            Get a Quote
          </a>

<a href="/my-quotes">
  My Quotes
</a>

        
        </nav>

      </header>

      {/* ================= MAIN ================= */}

      <main id="home">

        {/* ================= HERO ================= */}

        <section className="hero">

          <img
            className="hero-photo"
            src={familyHero}
            alt=""
          />

          <div className="hero-content">

            <p className="eyebrow">
              PROTECTING WHAT MATTERS MOST
            </p>

            <h1>
              Plan Your
              <br />
              <span>Health Cover</span>
              <br />
              With Confidence.
            </h1>

            <p className="hero-description">
              Estimate your health insurance costs quickly and
              <br className="desktop-break" />
              make informed choices for you and your family.
            </p>

            <a
              className="primary-button"
              href="/quote"
            >
              Get a Quote
              <Arrow />
            </a>

          </div>

        </section>

        {/* ================= FEATURE STRIP ================= */}

        <section
          className="feature-strip"
          aria-label="HealthCoverSim features"
        >

          {features.map((feature) => (
            <article
              className="feature"
              key={feature.title}
            >

              <FeatureIcon
                src={feature.icon}
                alt=""
              />

              <div>
                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.text}
                </p>
              </div>

            </article>
          ))}

        </section>

        {/* ================= ABOUT ================= */}

        <section
          className="about-section"
          id="about"
        >

          {/* Watermark */}
          <img
            className="about-watermark"
            src={watermarkLogo}
            alt=""
            aria-hidden="true"
          />

          <div className="about-copy">

            <p className="section-eyebrow">
              WHAT IS HEALTHCOVERSIM ?
            </p>

            <h2>
              A simpler way to
              <br />
              understand your
              <br />
              <span>health cover.</span>
            </h2>

            <p className="body-copy">
              HealthCoverSim is a private health insurance quote
              simulator that helps you estimate your cover based on
              your personal details, hospital cover, extras cover and
              payment preference, so you can make informed decisions
              for you and your family.
            </p>

          </div>

          {/* Chart */}

          <div
            className="chart-wrap"
            aria-label="Illustrative comparison chart"
          >

            <div className="chart-value">
              50%
            </div>

            <div className="chart-rule" />

<p className="chart-copy">
  of people worldwide struggle
  <br />
  to cover unexpected
  <br />
  <strong className="chart-price">US$1,000</strong>{" "}
  <strong className="chart-expense">medical expenses.</strong>
</p>

            <div className="bars">

<div className="bar-column">
  <div className="bar bar-1" />
  <span className="label-high">
    High income
    <br />
    countries
  </span>
</div>

<div className="bar-column">
  <div className="bar bar-2" />
  <span className="label-middle">
    Middle income
    <br />
    countries
  </span>
</div>

<div className="bar-column">
  <div className="bar bar-3" />
  <span className="label-low">
    Low income
    <br />
    countries
  </span>
</div>

            </div>

            <small className="source">
              Source : World Health Organization (2021)
            </small>

          </div>

        </section>

        {/* ================= HOW IT WORKS ================= */}

        <section
          className="steps-section"
          id="quote"
        >

          <div className="steps-heading">

            <p className="section-eyebrow">
              TAKE CONTROL OF YOUR HEALTH COVER
            </p>

            <h2>
              Get a personalized estimate in{" "}
              <span>minutes.</span>
            </h2>

            <p>
              A simple and transparent way to estimate your private
              health
              <br className="desktop-break" />
              insurance costs. Follow the steps below to see how it
              works.
            </p>

          </div>

          <div
            className="steps-board"
            id="interactive-steps"
          >

            {steps.map((step, index) => (
              <button
                className={`step-card ${
                  index === 1 ? "is-active" : ""
                }`}
                key={step.number}
                type="button"
                aria-expanded={index === 1}
                aria-controls={`step-content-${index}`}
                onClick={activateStep}
                onMouseEnter={handleStepHover}
              >

                <span className="step-number">
                  {step.number}
                </span>



                <span className="step-bottom">

<span className={`step-icon step-icon-${index + 1}`}>
  <img src={step.icon} alt="" />
</span>
                  <span
                    className="step-title"
                    id={`step-content-${index}`}
                  >
                    {step.title}
                  </span>

                  <span className="step-description">
                    {step.description}
                  </span>

                  <span className="step-action">
                    Learn more
                    <Arrow />
                  </span>

                </span>

              </button>
            ))}

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer
        className="footer"
        id="quotes"
      >

        <HealthCoverLogo />

        <p>
          © 2026 HealthCoverSim · Private health insurance quote
          simulator
        </p>

        <div className="footer-links">

          <a href="#privacy">
            Privacy Policy
          </a>

          <span>|</span>

          <a href="#terms">
            Terms of Use
          </a>

        </div>

      </footer>

    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/quote" element={<GetAQuote />} />
  <Route path="/quote-result/:id" element={<QuoteResult />} />
  <Route path="/my-quotes" element={<MyQuotes />} />
</Routes>
    </BrowserRouter>
  );
}