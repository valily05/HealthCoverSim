
const express = require("express");
const db = require("../db");
const router = express.Router();

const COVER_TYPES = ["Single", "Couple", "Family"];
const HISTORY_OPTIONS = ["Yes", "No", "Not sure"];
const HOSPITAL_OPTIONS = ["None", "Basic", "Bronze", "Silver", "Gold"];
const EXTRAS_OPTIONS = ["None", "Basic", "Standard", "Premium"];
const PAYMENT_OPTIONS = ["Monthly", "Yearly"];

function validateQuote(body) {
  const {
    customer_name,
    cover_type,
    applicant1_age,
    applicant1_previous_cover,
    applicant2_age,
    applicant2_previous_cover,
    hospital_cover,
    extras_cover,
    payment_frequency,
    annual_discount = 0,
  } = body;

  if (typeof customer_name !== "string" || !customer_name.trim()) {
    return "Customer name is required.";
  }

  if (!COVER_TYPES.includes(cover_type)) {
    return "Cover type must be Single, Couple, or Family.";
  }

  if (
    !Number.isInteger(applicant1_age) ||
    applicant1_age < 18 ||
    applicant1_age > 100
  ) {
    return "Applicant 1 age must be an integer between 18 and 100.";
  }

  if (!HISTORY_OPTIONS.includes(applicant1_previous_cover)) {
    return "Applicant 1 hospital cover history is invalid.";
  }

  if (cover_type === "Single") {
    if (applicant2_age != null || applicant2_previous_cover != null) {
      return "Single cover must not include Applicant 2.";
    }
  } else {
    if (
      !Number.isInteger(applicant2_age) ||
      applicant2_age < 18 ||
      applicant2_age > 100
    ) {
      return "Applicant 2 age must be an integer between 18 and 100 for Couple or Family cover.";
    }

    if (!HISTORY_OPTIONS.includes(applicant2_previous_cover)) {
      return "Applicant 2 hospital cover history is required and must be valid.";
    }
  }

  if (!HOSPITAL_OPTIONS.includes(hospital_cover)) {
    return "Hospital cover selection is invalid.";
  }

  if (!EXTRAS_OPTIONS.includes(extras_cover)) {
    return "Extras cover selection is invalid.";
  }

  if (!PAYMENT_OPTIONS.includes(payment_frequency)) {
    return "Payment frequency must be Monthly or Yearly.";
  }

  if (
    typeof annual_discount !== "number" ||
    !Number.isFinite(annual_discount) ||
    annual_discount < 0 ||
    annual_discount > 10
  ) {
    return "Annual discount must be between 0 and 10.";
  }

  return null;
}

function normalizeQuote(body) {
  const isSingle = body.cover_type === "Single";

  return {
    customer_name: body.customer_name.trim(),
    cover_type: body.cover_type,
    applicant1_age: body.applicant1_age,
    applicant1_previous_cover: body.applicant1_previous_cover,
    applicant2_age: isSingle ? null : body.applicant2_age,
    applicant2_previous_cover: isSingle
      ? null
      : body.applicant2_previous_cover,
    hospital_cover: body.hospital_cover,
    extras_cover: body.extras_cover,
    payment_frequency: body.payment_frequency,
    annual_discount:
      body.payment_frequency === "Yearly"
        ? body.annual_discount ?? 0
        : 0,
    notes: typeof body.notes === "string" ? body.notes.trim() : "",
  };
}

// GET all quotes
router.get("/", (req, res) => {
  try {
    const quotes = db
      .prepare("SELECT * FROM quotes ORDER BY created_at DESC")
      .all();

    res.status(200).json(quotes);
  } catch (error) {
    console.error("Error retrieving quotes:", error);
    res.status(500).json({ error: "Failed to retrieve quotes." });
  }
});

// POST a new quote
router.post("/", (req, res) => {
  const validationError = validateQuote(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const quote = normalizeQuote(req.body);

    const result = db
      .prepare(`
        INSERT INTO quotes (
          customer_name,
          cover_type,
          applicant1_age,
          applicant1_previous_cover,
          applicant2_age,
          applicant2_previous_cover,
          hospital_cover,
          extras_cover,
          payment_frequency,
          annual_discount,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        quote.customer_name,
        quote.cover_type,
        quote.applicant1_age,
        quote.applicant1_previous_cover,
        quote.applicant2_age,
        quote.applicant2_previous_cover,
        quote.hospital_cover,
        quote.extras_cover,
        quote.payment_frequency,
        quote.annual_discount,
        quote.notes
      );

    res.status(201).json({
      message: "Quote saved successfully.",
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("Error saving quote:", error);
    res.status(500).json({ error: "Could not save quote." });
  }
});

// GET one quote by ID
router.get("/:id", (req, res) => {
  try {
    const quote = db
      .prepare("SELECT * FROM quotes WHERE id = ?")
      .get(req.params.id);

    if (!quote) {
      return res.status(404).json({ error: "Quote not found." });
    }

    res.status(200).json(quote);
  } catch (error) {
    console.error("Error retrieving quote:", error);
    res.status(500).json({ error: "Failed to retrieve quote." });
  }
});

// PUT update an existing quote
router.put("/:id", (req, res) => {
  const validationError = validateQuote(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const quote = normalizeQuote(req.body);

    const result = db
      .prepare(`
        UPDATE quotes
        SET
          customer_name = ?,
          cover_type = ?,
          applicant1_age = ?,
          applicant1_previous_cover = ?,
          applicant2_age = ?,
          applicant2_previous_cover = ?,
          hospital_cover = ?,
          extras_cover = ?,
          payment_frequency = ?,
          annual_discount = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(
        quote.customer_name,
        quote.cover_type,
        quote.applicant1_age,
        quote.applicant1_previous_cover,
        quote.applicant2_age,
        quote.applicant2_previous_cover,
        quote.hospital_cover,
        quote.extras_cover,
        quote.payment_frequency,
        quote.annual_discount,
        quote.notes,
        req.params.id
      );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Quote not found." });
    }

    res.status(200).json({
      message: "Quote updated successfully.",
    });
  } catch (error) {
    console.error("Error updating quote:", error);
    res.status(500).json({ error: "Could not update quote." });
  }
});

// DELETE a quote
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM quotes WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Quote not found." });
    }

    res.status(200).json({
      message: "Quote deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    res.status(500).json({ error: "Could not delete quote." });
  }
});

module.exports = router;

