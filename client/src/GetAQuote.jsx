
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./GetAQuote.css";
import {
  createQuote,
  getQuote,
  updateQuote,
} from "./services/quoteService";
import logo from "./assets/logo.png";
import {
  calculatePremium,
  HOSPITAL_OPTIONS,
  EXTRAS_OPTIONS,
} from "./calculatePremium";
import { AlertTriangle } from "lucide-react";

const COVER_TYPES = [
  { value: "Single", subtitle: "1 adult" },
  { value: "Couple", subtitle: "2 adults" },
  { value: "Family", subtitle: "2 adults + children" },
];

const HISTORY_OPTIONS = ["Yes", "No", "Not sure"];

function HealthCoverLogo() {
  return (
    <a className="quote-brand" href="/" aria-label="HealthCoverSim home">
      <img src={logo} alt="" />
      <span className="quote-brand-copy">
        <strong>
          HealthCover<span>Sim</span>
        </strong>
        <small>INSURANCE</small>
      </span>
    </a>
  );
}


function Stepper({
  currentStep,
  unlockedStep,
  onStepClick,
  personalInfoValid,
  coverValid,
  paymentValid,
}) {
  const steps = [
    "Personal info",
    "Choose cover",
    "Payment preference",
    "Your estimate",
  ];

  const completedThrough = personalInfoValid
    ? coverValid
      ? paymentValid
        ? 3
        : 2
      : 1
    : 0;

  return (
    <div className="quote-stepper" aria-label="Quote progress">
      {steps.map((label, index) => {
        const step = index + 1;
        const completed = step <= completedThrough;
        const inProgress = step === completedThrough + 1;
        const locked = step > completedThrough + 1;
        const active = step === currentStep;

        const statusClass = completed
          ? "completed-status"
          : inProgress
            ? "active-status"
            : "locked-status";

        return (
          <button
            type="button"
            key={label}
            className={`quote-step ${
              completed
                ? "step-completed"
                : inProgress
                  ? "step-in-progress"
                  : "step-locked"
            }`}
            disabled={locked || step > unlockedStep}
            onClick={() => onStepClick(step)}
          >
            <span className="quote-step-top">
              <span
                className={`quote-step-circle ${
                  completed
                    ? "completed"
                    : inProgress
                      ? "in-progress"
                      : "locked"
                } ${active ? "active" : ""}`}
              >
                {completed ? "✓" : locked ? "🔒" : step}
              </span>

              {index < steps.length - 1 && (
                <span
                  className={`quote-step-line ${
                    completed ? "completed-line" : ""
                  }`}
                />
              )}
            </span>

            <strong>Step {step}</strong>
            <b>{label}</b>

            <span className={`step-status ${statusClass}`}>
              {completed
                ? "Completed"
                : inProgress
                  ? "In progress"
                  : "Locked"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  title,
  subtitle,
  price,
  unit,
}) {
  return (
    <button
      type="button"
      className={`quote-choice-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="choice-radio" aria-hidden="true">
        {selected && <span />}
      </span>

      <span className="choice-content">
        <strong>{title}</strong>

        {price !== undefined && (
          <b className="choice-price">
            ${price}
            <small>{unit}</small>
          </b>
        )}

        {subtitle && (
          <span className="choice-subtitle">{subtitle}</span>
        )}
      </span>
    </button>
  );
}

function SectionHeading({
  number,
  title,
  description,
  optional,
}) {
  return (
    <div className="quote-section-heading">
      <span className="quote-section-number">{number}</span>

      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {optional && (
        <span className="quote-optional">{optional}</span>
      )}
    </div>
  );
}

function ApplicantFields({
  applicant,
  index,
  updateApplicant,
  errors,
}) {
  return (
    <div className="applicant-card">
      <h3>Applicant {index + 1}</h3>

      <div className="applicant-fields">
        <label className="quote-field">
          <span>
            Age <i>*</i>
          </span>

          <input
            type="number"
            min="18"
            max="100"
            value={applicant.age}
            placeholder="18–100"
            onChange={(event) =>
              updateApplicant(index, "age", event.target.value)
            }
            aria-invalid={Boolean(errors[`age${index}`])}
          />

          {errors[`age${index}`] && (
            <small className="field-error">
              {errors[`age${index}`]}
            </small>
          )}
        </label>

        <label className="quote-field">
          <span>
            Hospital Cover History <i>*</i>
          </span>

          <select
            value={applicant.history}
            onChange={(event) =>
              updateApplicant(index, "history", event.target.value)
            }
            aria-invalid={Boolean(errors[`history${index}`])}
          >
            <option value="">Select History</option>

            {HISTORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {errors[`history${index}`] && (
            <small className="field-error">
              {errors[`history${index}`]}
            </small>
          )}
        </label>
      </div>
    </div>
  );
}

export default function GetAQuote() {
  const [form, setForm] = useState({
    customerName: "",
    coverType: "",
    applicants: [{ age: "", history: "" }],
    hospital: "",
    extras: "",
    payment: "",
    discount: "0",
    notes: "",
  });
  const navigate = useNavigate();
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState("");
const [savedQuoteId, setSavedQuoteId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [attemptedContinue, setAttemptedContinue] = useState(false);
const [searchParams] = useSearchParams();
const editId = searchParams.get("edit");
const isEditMode = Boolean(editId);
const [isLoadingQuote, setIsLoadingQuote] = useState(
  Boolean(editId)
);
  const applicantCount = !form.coverType
    ? 0
    : form.coverType === "Single"
      ? 1
      : 2;

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateCoverType = (coverType) => {
    setForm((previous) => ({
      ...previous,
      coverType,
      applicants:
        coverType === "Single"
          ? [
              previous.applicants[0] || {
                age: "",
                history: "",
              },
            ]
          : [
              previous.applicants[0] || {
                age: "",
                history: "",
              },
              previous.applicants[1] || {
                age: "",
                history: "",
              },
            ],
    }));
  };

  const updateApplicant = (index, field, value) => {
    setForm((previous) => {
      const applicants = [...previous.applicants];

      applicants[index] = {
        ...applicants[index],
        [field]: value,
      };

      return {
        ...previous,
        applicants,
      };
    });
  };
useEffect(() => {
  if (!editId) {
    setIsLoadingQuote(false);
    return;
  }

  let cancelled = false;

  async function loadQuote() {
    try {
      setIsLoadingQuote(true);
      setSaveError("");

      const quote = await getQuote(editId);

      if (cancelled) return;

      setForm({
        customerName: quote.customer_name ?? "",
        coverType: quote.cover_type ?? "",
        applicants: [
          {
            age: quote.applicant1_age?.toString() ?? "",
            history: quote.applicant1_previous_cover ?? "",
          },
          ...(quote.cover_type !== "Single"
            ? [
                {
                  age: quote.applicant2_age?.toString() ?? "",
                  history: quote.applicant2_previous_cover ?? "",
                },
              ]
            : []),
        ],
        hospital: quote.hospital_cover ?? "",
        extras: quote.extras_cover ?? "",
        payment: quote.payment_frequency ?? "",
        discount: String(quote.annual_discount ?? 0),
        notes: quote.notes ?? "",
      });

      setCurrentStep(1);
      setAttemptedContinue(false);
    } catch (error) {
      if (!cancelled) {
        setSaveError(error.message || "Unable to load quote.");
      }
    } finally {
      if (!cancelled) {
        setIsLoadingQuote(false);
      }
    }
  }

  loadQuote();

  return () => {
    cancelled = true;
  };
}, [editId]);
  const errors = useMemo(() => {
    const result = {};

    if (!form.customerName.trim()) {
      result.customerName = "Enter the customer name.";
    }

    for (let index = 0; index < applicantCount; index += 1) {
      const applicant = form.applicants[index] || {};
      const age = Number(applicant.age);

      if (!applicant.age) {
        result[`age${index}`] = "Enter an age.";
      } else if (
        !Number.isInteger(age) ||
        age < 18 ||
        age > 100
      ) {
        result[`age${index}`] =
          "Age must be between 18 and 100.";
      }

      if (!applicant.history) {
        result[`history${index}`] =
          "Select a history option.";
      }
    }

    if (!form.hospital) {
      result.hospital = "Select hospital cover.";
    }

    if (!form.extras) {
      result.extras = "Select extras cover.";
    }

    const discount = Number(form.discount);

    if (
      form.payment === "Yearly" &&
      (
        form.discount === "" ||
        discount < 0 ||
        discount > 10
      )
    ) {
      result.discount =
        "Enter a discount from 0% to 10%.";
    }

    return result;
  }, [form, applicantCount]);

  const personalInfoValid =
    Boolean(form.customerName.trim()) &&
    Boolean(form.coverType);

  const coverValid =
    personalInfoValid &&
    Array.from({ length: applicantCount }).every(
      (_, index) => {
        const applicant = form.applicants[index] || {};
        const age = Number(applicant.age);

        return (
          Number.isInteger(age) &&
          age >= 18 &&
          age <= 100 &&
          Boolean(applicant.history)
        );
      }
    ) &&
    Boolean(form.hospital) &&
    Boolean(form.extras);

  const paymentValid =
    coverValid &&
    Boolean(form.payment) &&
    (
      form.payment !== "Yearly" ||
      (
        form.discount !== "" &&
        Number(form.discount) >= 0 &&
        Number(form.discount) <= 10
      )
    );

  const unlockedStep = !personalInfoValid
    ? 1
    : !coverValid
      ? 2
      : !paymentValid
        ? 3
        : 4;

  const isValid = paymentValid;

const estimate = useMemo(() => {
  return calculatePremium(form, applicantCount);
}, [form, applicantCount]);

const canShowEstimate = isValid && estimate !== null;

  const handleStepClick = (step) => {
    if (step <= unlockedStep) {
      setCurrentStep(step);
      setAttemptedContinue(false);
    }
  };

  const handleContinue = () => {
    setAttemptedContinue(true);

    const validForStep =
      currentStep === 1
        ? personalInfoValid
        : currentStep === 2
          ? coverValid
          : currentStep === 3
            ? paymentValid
            : true;

    if (!validForStep) {
      document
        .querySelector(".quote-form-card")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 4));
    setAttemptedContinue(false);
  };
const handleSaveQuote = async () => {
  if (!paymentValid || !canShowEstimate || isSaving) {
    return;
  }

  setIsSaving(true);
  setSaveError("");

  const quoteData = {
    customer_name: form.customerName.trim(),
    cover_type: form.coverType,
    applicant1_age: Number(form.applicants[0].age),
    applicant1_previous_cover: form.applicants[0].history,
    applicant2_age:
      applicantCount === 2
        ? Number(form.applicants[1].age)
        : null,
    applicant2_previous_cover:
      applicantCount === 2
        ? form.applicants[1].history
        : null,
    hospital_cover: form.hospital,
    extras_cover: form.extras,
    payment_frequency: form.payment,
    annual_discount:
      form.payment === "Yearly"
        ? Number(form.discount)
        : 0,
    notes: form.notes.trim(),
  };

try {
  let result;

  if (isEditMode) {
    await updateQuote(editId, quoteData);
    result = { id: editId };
  } else {
    result = await createQuote(quoteData);
  }

  navigate(`/quote-result/${result.id}`, {
    state: {
      quoteData,
      estimate,
    },
  });
} catch (error) {
  setSaveError(error.message || "Unable to save quote.");
} finally {
  setIsSaving(false);
}
};
  const handleReset = () => {
    setForm({
      customerName: "",
      coverType: "",
      applicants: [{ age: "", history: "" }],
      hospital: "",
      extras: "",
      payment: "",
      discount: "0",
      notes: "",
    });

    setCurrentStep(1);
    setAttemptedContinue(false);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(amount);



  return (
    <div className="quote-page">
      <header className="quote-header">
        <HealthCoverLogo />

        <nav
          className="quote-nav"
          aria-label="Main navigation"
        >
          <a href="/">Home</a>
          <a
            className="active"
            aria-current="page"
            href="/quote"
          >
            Get a Quote
          </a>
          <a href="/my-quotes">My Quotes</a>
          <a href="/#about">About</a>
        </nav>
      </header>

      <main className="quote-main">
        <Stepper
          currentStep={currentStep}
          unlockedStep={unlockedStep}
          onStepClick={handleStepClick}
          personalInfoValid={personalInfoValid}
          coverValid={coverValid}
          paymentValid={paymentValid}
        />

        <div className="quote-layout">
          <form
            className="quote-form-card"
            onSubmit={(event) => {
              event.preventDefault();
              handleContinue();
            }}
            noValidate
          >
            {isLoadingQuote && (
  <p role="status">Loading saved quote...</p>
)}
            {/* Step 1: Personal information */}
            <section
              className={`quote-section ${
                currentStep !== 1 ? "section-inactive" : ""
              }`}
            >
              <SectionHeading
                number="1"
                title="Personal Information"
                description="Let’s start with some basic details."
              />

              <label className="quote-field customer-field">
                <span>
                  Customer name <i>*</i>
                </span>

                <input
                  type="text"
                  value={form.customerName}
                  placeholder="e.g. Alex Tan"
                  onChange={(event) =>
                    updateField(
                      "customerName",
                      event.target.value
                    )
                  }
                  aria-invalid={Boolean(
                    attemptedContinue && errors.customerName
                  )}
                />

                {attemptedContinue &&
                  errors.customerName && (
                    <small className="field-error">
                      {errors.customerName}
                    </small>
                  )}
              </label>

              <fieldset className="cover-type-fieldset">
                <legend>
                  Who will be covered? <i>*</i>
                </legend>

                <div className="cover-type-options">
                  {COVER_TYPES.map((type) => (
                    <ChoiceCard
                      key={type.value}
                      title={type.value}
                      subtitle={type.subtitle}
                      selected={
                        form.coverType === type.value
                      }
                      onClick={() =>
                        updateCoverType(type.value)
                      }
                    />
                  ))}
                </div>
              </fieldset>
            </section>

            {/* Step 2: Choose cover */}
            <section
              className={`quote-section ${
                unlockedStep < 2
                  ? "section-locked"
                  : currentStep !== 2
                    ? "section-inactive"
                    : ""
              }`}
            >
              <SectionHeading
                number="2"
                title="Choose Cover"
                description="Enter applicant details and select your hospital and extras cover."
              />

              {Array.from({
                length: applicantCount,
              }).map((_, index) => (
                <ApplicantFields
                  key={index}
                  applicant={
                    form.applicants[index] || {
                      age: "",
                      history: "",
                    }
                  }
                  index={index}
                  updateApplicant={updateApplicant}
                  errors={
                    attemptedContinue ? errors : {}
                  }
                />
              ))}

              <fieldset className="cover-selection">
                <legend>
                  Hospital Cover <i>*</i>
                </legend>

                <div className="rate-options hospital-options">
                  {HOSPITAL_OPTIONS.map((option) => (
                    <ChoiceCard
                      key={option.name}
                      title={option.name}
                      price={option.price}
                      unit=" per adult/month"
                      selected={
                        form.hospital === option.name
                      }
                      onClick={() =>
                        updateField(
                          "hospital",
                          option.name
                        )
                      }
                    />
                  ))}
                </div>

                {attemptedContinue &&
                  errors.hospital && (
                    <small className="field-error">
                      {errors.hospital}
                    </small>
                  )}
              </fieldset>

              <fieldset className="cover-selection">
                <legend>
                  Extras Cover <i>*</i>
                </legend>

                <div className="rate-options extras-options">
                  {EXTRAS_OPTIONS.map((option) => (
                    <ChoiceCard
                      key={option.name}
                      title={option.name}
                      price={option.price}
                      unit=" / month"
                      selected={
                        form.extras === option.name
                      }
                      onClick={() =>
                        updateField(
                          "extras",
                          option.name
                        )
                      }
                    />
                  ))}
                </div>

                {attemptedContinue &&
                  errors.extras && (
                    <small className="field-error">
                      {errors.extras}
                    </small>
                  )}
              </fieldset>
            </section>

            {/* Step 3: Payment preference */}
            <section
              className={`quote-section ${
                unlockedStep < 3
                  ? "section-locked"
                  : currentStep !== 3
                    ? "section-inactive"
                    : ""
              }`}
            >
              <SectionHeading
                number="3"
                title="Payment Preference"
                description="Choose how you would like to pay."
              />

              <div className="payment-grid">
                <fieldset className="payment-fieldset">
                  <legend>
                    Payment Plan <i>*</i>
                  </legend>

                  <div className="payment-options">
                    {[
                      {
                        value: "Monthly",
                        description:
                          "Pay monthly – no annual discount",
                      },
                      {
                        value: "Yearly",
                        description:
                          "Pay yearly – discount available",
                      },
                    ].map((option) => (
                      <ChoiceCard
                        key={option.value}
                        title={option.value}
                        subtitle={option.description}
                        selected={
                          form.payment === option.value
                        }
                        onClick={() =>
                          updateField(
                            "payment",
                            option.value
                          )
                        }
                      />
                    ))}
                  </div>
                </fieldset>

                <label className="quote-field discount-field">
                  <span>Annual-payment discount%</span>

                  <div
                    className={`discount-input ${
                      form.payment !== "Yearly"
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={form.discount}
                      disabled={
                        form.payment !== "Yearly"
                      }
                      onChange={(event) =>
                        updateField(
                          "discount",
                          event.target.value
                        )
                      }
                    />

                    <span>%</span>
                  </div>

                  <small>
                    0–10%. Only applied when Yearly is
                    selected.
                  </small>

                  {attemptedContinue &&
                    errors.discount && (
                      <small className="field-error">
                        {errors.discount}
                      </small>
                    )}
                </label>
              </div>
            </section>

            {/* Additional notes */}
            <section className="quote-section notes-section">
              <SectionHeading
                number="4"
                title="Additional Notes"
                optional="Optional"
              />

              <label className="quote-field">
                <span className="visually-hidden">
                  Additional notes
                </span>

                <textarea
                  rows="4"
                  value={form.notes}
                  placeholder="Anything you’d like to note about this quote..."
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                />
              </label>
            </section>

            <div className="quote-form-actions">
              <div className="quote-action-left">
                

<button
  type="button"
  className={`save-quote-button ${
    canShowEstimate ? "ready" : "not-ready"
  }`}
  onClick={handleSaveQuote}
  disabled={
    !canShowEstimate ||
    isSaving ||
    isLoadingQuote
  }
>
  {isSaving
    ? isEditMode
      ? "Updating..."
      : "Saving..."
    : isEditMode
      ? "Update Quote"
      : "Save Quote"}
</button>
              </div>

              
         

{saveError && (
  <p className="save-error" role="alert">
    {saveError}
  </p>
)}


            </div>
          </form>

          {/* Estimate and summary */}
          <aside className="estimate-column">
            <section className="estimate-card">
              <div className="estimate-card-heading">
                <span className="estimate-eyebrow">YOUR ESTIMATE</span>
                <h2>Estimated premium</h2>
              </div>

              {canShowEstimate && estimate ? (
                <>
                  <div className="estimate-total">
                    <strong>
                      {formatCurrency(
                        form.payment === "Yearly"
                          ? estimate.yearlyAfterDiscount
                          : estimate.monthly
                      )}
                    </strong>
<span>
  {" "}
  {form.payment === "Yearly" ? "/ year" : "/ month"}
</span>
                  </div>

<div className="premium-breakdown">
  <h3>Premium breakdown</h3>

  <div className="summary-row">
    <span>Hospital premium (base)</span>
    <b>{formatCurrency(estimate.hospitalBasePremium)}</b>
  </div>

  {estimate.applicantLoadings.map((item, index) => (
    <div className="summary-row" key={index}>
      <span>
        Applicant {index + 1} LHC loading ({item.percent}%)
      </span>
      <b>{formatCurrency(item.amount)}</b>
    </div>
  ))}

  <div className="summary-row">
    <span>Extras premium</span>
    <b>{formatCurrency(estimate.extrasPremium)}</b>
  </div>

  <div className="summary-row">
    <span>Family upgrade fee</span>
    <b>{formatCurrency(estimate.familyFee)}</b>
  </div>

  <div className="summary-row total-row">
    <span>Monthly premium</span>
    <b>{formatCurrency(estimate.monthly)}</b>
  </div>

  <div className="summary-row">
    <span>Yearly before discount</span>
    <b>{formatCurrency(estimate.yearlyBeforeDiscount)}</b>
  </div>

  {form.payment === "Yearly" && (
    <>
      <div className="summary-row">
        <span>
          Annual discount ({estimate.discountPercent}%)
        </span>
        <b>
          -{formatCurrency(estimate.annualDiscountAmount)}
        </b>
      </div>

      <div className="summary-row total-row">
        <span>Yearly after discount</span>
        <b>{formatCurrency(estimate.yearlyAfterDiscount)}</b>
      </div>
    </>
  )}
</div>
                </>
              ) : (
                <div className="estimate-empty">
                  <p>Complete the required steps to view your estimate.</p>
                </div>
              )}

<div className="estimate-warning estimate-info">
    <span className="warning-icon" aria-hidden="true">
    i
  </span>
  <p>
    Lifetime Health Cover loading applies only to hospital cover.
    It does not apply to extras cover.
  </p>
</div>
{form.applicants.map((applicant, index) =>
  applicant.history === "Not sure" ? (
    <div className="estimate-warning" key={index}>
<span className="warning-icon" aria-hidden="true">
  <AlertTriangle size={22} strokeWidth={2.7} />
</span>
      <p>
        Applicant {index + 1}: Cover history is unknown —
        LHC loading has not been applied. This quote may
        be inaccurate.
      </p>
    </div>
  ) : null
)}
{estimate?.warnings
  ?.filter(
    (warning) =>
      !warning.includes("Cover history is unknown")
  )
  .map((warning, index) => (
    <div className="estimate-warning" key={index}>
      <span className="warning-icon" aria-hidden="true">
        <AlertTriangle size={22} strokeWidth={2.5} />
      </span>
      <p>{warning}</p>
    </div>
  ))}
            </section>

            <section className="quote-summary-card">
              <h3>QUOTE SUMMARY</h3>
              {[
                ["Customer name", form.customerName || "–"],
                ["Cover type", form.coverType || "–"],
                ["Number of applicants", String(applicantCount)],
                ["Hospital cover", form.hospital || "–"],
                ["Extras cover", form.extras || "–"],
                ["Payment frequency", form.payment || "–"],
                [
                  "Annual discount",
                  form.payment === "Yearly" ? `${form.discount || 0}%` : "–",
                ],
              ].map(([label, value]) => (
                <div className="summary-row" key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}

              <div className="summary-note">
                <span aria-hidden="true">i</span>
                <p>
                  Your estimated premium is calculated from the information
                  you provide.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <footer className="quote-footer">
        <HealthCoverLogo />

        <p>
          © 2026 HealthCoverSim · Private health insurance
          quote simulator
        </p>

        <div>
          <a href="/privacy">Privacy Policy</a>
          <span>|</span>
          <a href="/terms">Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}