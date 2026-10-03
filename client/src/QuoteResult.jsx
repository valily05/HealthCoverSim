
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import logo from "./assets/logo.png";
import { getQuoteById } from "./services/quoteService";
import { calculatePremium } from "./calculatePremium";
import "./QuoteResult.css";

function HealthCoverLogo() {
  return (
    <Link className="quote-brand" to="/" aria-label="Home">
      <img src={logo} alt="" />
      <span className="quote-brand-copy">
        <strong>
          HealthCover<span>Sim</span>
        </strong>
        <small>INSURANCE</small>
      </span>
    </Link>
  );
}

export default function QuoteResult() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuote() {
      try {
        setLoading(true);
        setError("");

        const data = await getQuoteById(id);

        if (active) {
          setQuote(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load quote.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuote();

    return () => {
      active = false;
    };
  }, [id]);

  const applicantCount = quote
    ? quote.cover_type === "Single"
      ? 1
      : 2
    : 0;

  const form = useMemo(() => {
    if (!quote) return null;

    return {
      customerName: quote.customer_name,
      coverType: quote.cover_type,
      applicants: [
        {
          age: String(quote.applicant1_age),
          history: quote.applicant1_previous_cover,
        },
        ...(applicantCount === 2
          ? [
              {
                age: String(quote.applicant2_age),
                history: quote.applicant2_previous_cover,
              },
            ]
          : []),
      ],
      hospital: quote.hospital_cover,
      extras: quote.extras_cover,
      payment: quote.payment_frequency,
      discount: String(quote.annual_discount ?? 0),
      notes: quote.notes || "",
    };
  }, [quote, applicantCount]);

  const estimate = useMemo(() => {
    if (!form) return null;
    return calculatePremium(form, applicantCount);
  }, [form, applicantCount]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));

  if (loading) {
    return (
      <main className="result-state">
        <p>Loading your quote...</p>
      </main>
    );
  }

  if (error || !quote || !estimate) {
    return (
      <main className="result-state">
        <h2>Unable to display quote</h2>
        <p>{error || "Quote information is unavailable."}</p>
        <Link to="/my-quotes">Go to My Quotes</Link>
      </main>
    );
  }

  const yearly = quote.payment_frequency === "Yearly";
  const total = yearly
    ? estimate.yearlyAfterDiscount
    : estimate.monthly;

  const summary = [
    `${quote.customer_name} has a ${quote.cover_type.toLowerCase()} health insurance quote.`,
    `The selected hospital cover is ${quote.hospital_cover}, with ${quote.extras_cover} extras cover.`,
    `The quote covers ${applicantCount} adult applicant${applicantCount > 1 ? "s" : ""}.`,
    `The payment frequency is ${quote.payment_frequency.toLowerCase()}.`,
    yearly
      ? `The annual discount is ${quote.annual_discount}%, resulting in an estimated yearly premium of ${formatCurrency(estimate.yearlyAfterDiscount)}.`
      : `The estimated monthly premium is ${formatCurrency(estimate.monthly)}.`,
  ].join(" ");

  return (
    <div className="quote-page result-page">
      <header className="quote-header">
        <HealthCoverLogo />

        <nav className="quote-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/quote">Get a Quote</Link>
          <Link to="/my-quotes">My Quotes</Link>
          <Link to="/#about">About</Link>
        </nav>
      </header>

      <main className="result-main">
        <div className="result-heading">
          <p className="result-eyebrow">QUOTE SAVED SUCCESSFULLY</p>
          <h1>Your Quote Breakdown</h1>
          <p>
            Your quote has been saved. Review the details
            and estimated premium below.
          </p>

        </div>

        <section className="result-card">
          <div className="result-card-header">
            <div>
              <span className="result-eyebrow">ESTIMATED PREMIUM</span>
              <h2>{formatCurrency(total)}</h2>
              <span>{yearly ? "/ year" : "/ month"}</span>
            </div>
          </div>

          <div className="result-section">
            <h3>Customer and cover details</h3>

            <div className="result-details-grid">
              <div>
                <span>Customer name</span>
                <strong>{quote.customer_name}</strong>
              </div>

              <div>
                <span>Cover type</span>
                <strong>{quote.cover_type}</strong>
              </div>

              <div>
                <span>Hospital cover</span>
                <strong>{quote.hospital_cover}</strong>
              </div>

              <div>
                <span>Extras cover</span>
                <strong>{quote.extras_cover}</strong>
              </div>

              <div>
                <span>Payment frequency</span>
                <strong>{quote.payment_frequency}</strong>
              </div>

              <div>
                <span>Annual discount</span>
                <strong>
                  {yearly ? `${quote.annual_discount}%` : "Not applied"}
                </strong>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>Applicant details</h3>

            {form.applicants.map((applicant, index) => (
              <div className="result-applicant" key={index}>
                <h4>Applicant {index + 1}</h4>
                <div className="result-details-grid">
                  <div>
                    <span>Age</span>
                    <strong>{applicant.age}</strong>
                  </div>
                  <div>
                    <span>Hospital cover history</span>
                    <strong>{applicant.history}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="result-section">
            <h3>Premium breakdown</h3>

            <div className="result-breakdown-row">
              <span>Hospital premium (base)</span>
              <strong>{formatCurrency(estimate.hospitalBasePremium)}</strong>
            </div>

            {estimate.applicantLoadings.map((item, index) => (
              <div className="result-breakdown-row" key={index}>
                <span>
                  Applicant {index + 1} LHC loading ({item.percent}%)
                </span>
                <strong>{formatCurrency(item.amount)}</strong>
              </div>
            ))}

            <div className="result-breakdown-row">
              <span>Extras premium</span>
              <strong>{formatCurrency(estimate.extrasPremium)}</strong>
            </div>

            <div className="result-breakdown-row">
              <span>Family upgrade fee</span>
              <strong>{formatCurrency(estimate.familyFee)}</strong>
            </div>

            <div className="result-breakdown-row">
              <span>Monthly premium</span>
              <strong>{formatCurrency(estimate.monthly)}</strong>
            </div>

            <div className="result-breakdown-row">
              <span>Yearly before discount</span>
              <strong>{formatCurrency(estimate.yearlyBeforeDiscount)}</strong>
            </div>

            {yearly && (
              <>
                <div className="result-breakdown-row">
                  <span>
                    Annual discount ({estimate.discountPercent}%)
                  </span>
                  <strong>
                    -{formatCurrency(estimate.annualDiscountAmount)}
                  </strong>
                </div>

                <div className="result-breakdown-row result-total-row">
                  <span>Yearly after discount</span>
                  <strong>
                    {formatCurrency(estimate.yearlyAfterDiscount)}
                  </strong>
                </div>
              </>
            )}
          </div>

          <div className="result-section">
            <h3>Quote summary</h3>
            <p className="result-text-summary">{summary}</p>

            {quote.notes && (
              <div className="result-notes">
                <strong>Additional notes</strong>
                <p>{quote.notes}</p>
              </div>
            )}
          </div>

          <div className="result-disclaimer">
            <strong>Important information</strong>
            <p>
              This is an estimate generated from the information provided.
              Lifetime Health Cover loading applies to hospital cover,
              not extras cover. If an applicant's history is unknown,
              the estimate may be inaccurate.
            </p>
          </div>
        </section>

        <div className="result-actions">
          <Link className="result-primary-button" to="/my-quotes">
            View My Quotes
          </Link>
          <Link className="result-secondary-button" to="/quote">
            Create Another Quote
          </Link>
        </div>
      </main>

      <footer className="quote-footer">
        <HealthCoverLogo />
        <p>
          © 2026 HealthCoverSim · Private health insurance quote simulator
        </p>
      </footer>
    </div>
  );
}