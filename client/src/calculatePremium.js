export const HOSPITAL_OPTIONS = [
  { name: "None", price: 0 },
  { name: "Basic", price: 90 },
  { name: "Bronze", price: 120 },
  { name: "Silver", price: 160 },
  { name: "Gold", price: 220 },
];

export const EXTRAS_OPTIONS = [
  { name: "None", price: 0 },
  { name: "Basic", price: 25 },
  { name: "Standard", price: 45 },
  { name: "Premium", price: 70 },
];

const FAMILY_FEE = 30;

export function calculatePremium(form, applicantCount) {
  const hospitalRate = HOSPITAL_OPTIONS.find(
    (option) => option.name === form.hospital
  )?.price;

  const extrasRate = EXTRAS_OPTIONS.find(
    (option) => option.name === form.extras
  )?.price;

  if (
    !form.coverType ||
    hospitalRate === undefined ||
    extrasRate === undefined ||
    !Number.isInteger(applicantCount) ||
    applicantCount < 1
  ) {
    return null;
  }

  const applicants = (form.applicants || []).slice(0, applicantCount);
  if (applicants.length !== applicantCount) return null;

  const applicantLoadings = applicants.map((applicant, index) => {
    const age = Number(applicant.age);
    let percent = 0;
    const warnings = [];

    if (form.hospital !== "None" && applicant.history === "No" && age > 30) {
      percent = (age - 30) * 2;
    } else if (applicant.history === "Not sure") {
      warnings.push(
        `Applicant ${index + 1}: Cover history is unknown — LHC loading has not been applied. This quote may be inaccurate.`
      );
    }

    return {
      percent,
      amount: hospitalRate * (percent / 100),
      warnings,
    };
  });

  const hospitalPremium = applicants.reduce(
    (total, applicant, index) =>
      total +
      hospitalRate * (1 + applicantLoadings[index].percent / 100),
    0
  );

  const extrasPremium = extrasRate * applicantCount;
  const familyFee = form.coverType === "Family" ? FAMILY_FEE : 0;
  const hospitalBasePremium = hospitalRate * applicantCount;

const totalLoading = applicantLoadings.reduce(
  (total, item) => total + item.amount,
  0
);
  const monthly = hospitalPremium + extrasPremium + familyFee;

  const discountPercent =
    form.payment === "Yearly" ? Number(form.discount || 0) : 0;

  const yearlyBeforeDiscount = monthly * 12;
  const annualDiscountAmount =
    form.payment === "Yearly"
      ? yearlyBeforeDiscount * (discountPercent / 100)
      : 0;

  const yearlyAfterDiscount =
    yearlyBeforeDiscount - annualDiscountAmount;

  return {
    hospitalPremium,
    extrasPremium,
    applicantLoadings,
    familyFee,
    hospitalBasePremium,
totalLoading,
    monthlyBeforeDiscount: monthly,
    monthly,
    yearlyBeforeDiscount,
    annualDiscountAmount,
    yearlyAfterDiscount,
    discountPercent,
    yearlyTotal: yearlyAfterDiscount,
    displayed:
      form.payment === "Yearly" ? yearlyAfterDiscount : monthly,
    warnings: applicantLoadings.flatMap((item) => item.warnings),
  };
}