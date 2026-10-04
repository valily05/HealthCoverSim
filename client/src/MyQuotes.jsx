
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getQuotes,
  deleteQuote,
} from "./services/quoteService";
import { calculatePremium } from "./calculatePremium";
import "./MyQuotes.css";
import logo from "./assets/logo.png";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function getQuoteEstimate(quote) {
  const applicantCount =
    quote.cover_type === "Single" ? 1 : 2;

  const form = {
    customerName: quote.customer_name,
    coverType: quote.cover_type,
    applicants: [
      {
        age: String(quote.applicant1_age ?? ""),
        history: quote.applicant1_previous_cover,
      },
      ...(applicantCount === 2
        ? [
            {
              age: String(quote.applicant2_age ?? ""),
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

  return calculatePremium(form, applicantCount);
}

export default function MyQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  async function loadQuotes() {
    try {
      setLoading(true);
      setError("");

      const data = await getQuotes();
      setQuotes(data);
    } catch (err) {
      setError(err.message || "Unable to load quotes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  async function handleDelete(quote) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the quote for ${quote.customer_name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(quote.id);
      await deleteQuote(quote.id);

      setQuotes((previous) =>
        previous.filter((item) => item.id !== quote.id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete quote.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(quote) {
    navigate(`/quote?edit=${quote.id}`);
  }

  if (loading) {
    return (
      <main className="my-quotes-page">
        <p className="my-quotes-state">
          Loading your quotes...
        </p>
      </main>
    );
  }

  return (
    <div className="my-quotes-page">
      <header className="quote-header my-quotes-header">
        <Link to="/" className="quote-brand">
          <img src={logo} alt="" />

          <div className="quote-brand-copy">
            <strong>
              HealthCover<span>Sim</span>
            </strong>
            <small>INSURANCE</small>
          </div>
        </Link>

        <nav
          className="quote-nav"
          aria-label="Main navigation"
        >
          <Link to="/">Home</Link>
          <Link to="/quote">Get a Quote</Link>
          <Link to="/my-quotes" className="active">
            My Quotes
          </Link>
          <a href="/#about">About</a>
        </nav>
      </header>

      <main className="my-quotes-main">
        <div className="my-quotes-heading">
          <div>
            <p className="my-quotes-eyebrow">
              YOUR SAVED ESTIMATES
            </p>

            <h1>My Quotes</h1>

            <p>
              View, edit, and manage your saved health
              insurance estimates.
            </p>
          </div>

          <Link
            to="/quote"
            className="my-quotes-create"
          >
            + Create New Quote
          </Link>
        </div>

        {error && (
          <div className="my-quotes-error" role="alert">
            {error}
            <button onClick={loadQuotes}>
              Try again
            </button>
          </div>
        )}

        {quotes.length === 0 ? (
          <section className="my-quotes-empty">
            <div className="empty-icon">♡</div>

            <h2>No saved quotes yet</h2>

            <p>
              Your saved estimates will appear here.
              Create your first quote to get started.
            </p>

            <Link
              to="/quote"
              className="my-quotes-create"
            >
              Get a Quote
            </Link>
          </section>
        ) : (
          <div className="my-quotes-list">
            <div className="my-quotes-count">
              {quotes.length} saved{" "}
              {quotes.length === 1 ? "quote" : "quotes"}
            </div>

            {quotes.map((quote) => {
              let estimate = null;

              try {
                estimate = getQuoteEstimate(quote);
              } catch {
                // Keep the quote visible if its estimate
                // cannot be calculated.
              }

              const yearly =
                quote.payment_frequency === "Yearly";

              const total = estimate
                ? yearly
                  ? estimate.yearlyAfterDiscount
                  : estimate.monthly
                : null;

              return (
                <article
                  className="my-quote-card"
                  key={quote.id}
                >
                  <div className="my-quote-top">
                    <div>
                      <span className="my-quote-label">
                        QUOTE #{quote.id}
                      </span>

                      <h2>{quote.customer_name}</h2>

                      <p>
                        {quote.cover_type} ·{" "}
                        {quote.hospital_cover} hospital ·{" "}
                        {quote.extras_cover} extras
                      </p>
                    </div>

                    <div className="my-quote-price">
                      <strong>
                        {total !== null
                          ? formatCurrency(total)
                          : "Unavailable"}
                      </strong>

                      <span>
                        {yearly ? "per year" : "per month"}
                      </span>
                    </div>
                  </div>

                  <div className="my-quote-details">
                    <div>
                      <span>Payment</span>
                      <strong>
                        {quote.payment_frequency}
                      </strong>
                    </div>

                    <div>
                      <span>Annual discount</span>
                      <strong>
                        {yearly
                          ? `${quote.annual_discount ?? 0}%`
                          : "Not applied"}
                      </strong>
                    </div>

                    <div>
                      <span>Last updated</span>
                      <strong>
                        {quote.updated_at
                          ? new Date(
                              quote.updated_at
                            ).toLocaleDateString("en-AU")
                          : quote.created_at
                            ? new Date(
                                quote.created_at
                              ).toLocaleDateString("en-AU")
                            : "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="my-quote-actions">
                    <Link
                      to={`/quote-result/${quote.id}`}
                      className="my-quote-view"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      className="my-quote-edit"
                      onClick={() => handleEdit(quote)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="my-quote-delete"
                      disabled={deletingId === quote.id}
                      onClick={() => handleDelete(quote)}
                    >
                      {deletingId === quote.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="my-quotes-footer">
        © 2026 HealthCoverSim · Private health insurance
        quote simulator
      </footer>
    </div>
  );
}
