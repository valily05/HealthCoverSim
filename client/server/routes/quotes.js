const express = require("express");
const db = require("../db");

const router = express.Router();

// GET all quotes
router.get("/", (req, res) => {
  try {
    const quotes = db.prepare(
      "SELECT * FROM quotes ORDER BY created_at DESC"
    ).all();

    res.status(200).json(quotes);
  } catch (error) {
    console.error("Error retrieving quotes:", error);
    res.status(500).json({ error: "Failed to retrieve quotes" });
  }
});

// POST a new quote
router.post("/", (req, res) => {
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
    notes = ""
  } = req.body;

  if (
    !customer_name ||
    !cover_type ||
    applicant1_age == null ||
    !applicant1_previous_cover ||
    !hospital_cover ||
    !extras_cover ||
    !payment_frequency
  ) {
    return res.status(400).json({
      error: "Missing required quote information"
    });
  }

  try {
    const result = db.prepare(`
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
    `).run(
      customer_name,
      cover_type,
      applicant1_age,
      applicant1_previous_cover,
      applicant2_age ?? null,
      applicant2_previous_cover ?? null,
      hospital_cover,
      extras_cover,
      payment_frequency,
      annual_discount,
      notes
    );

    res.status(201).json({
      message: "Quote saved",
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Error saving quote:", error);
    res.status(500).json({ error: "Could not save quote" });
  }
});
// GET one quote by ID
router.get("/:id", (req, res) => {
  try {
    const quote = db.prepare(
      "SELECT * FROM quotes WHERE id = ?"
    ).get(req.params.id);

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.json(quote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve quote" });
  }
});

// PUT: Update an existing quote
router.put("/:id", (req, res) => {
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
    notes = ""
  } = req.body;

  if (
    !customer_name ||
    !cover_type ||
    applicant1_age == null ||
    !applicant1_previous_cover ||
    !hospital_cover ||
    !extras_cover ||
    !payment_frequency
  ) {
    return res.status(400).json({
      error: "Missing required quote information"
    });
  }

  try {
    const result = db.prepare(`
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
    `).run(
      customer_name,
      cover_type,
      applicant1_age,
      applicant1_previous_cover,
      applicant2_age ?? null,
      applicant2_previous_cover ?? null,
      hospital_cover,
      extras_cover,
      payment_frequency,
      annual_discount,
      notes,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Quote not found"
      });
    }

    res.json({ message: "Quote updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update quote" });
  }
});
// DELETE a quote by ID
router.delete("/:id", (req, res) => {
  try {
    const result = db.prepare(
      "DELETE FROM quotes WHERE id = ?"
    ).run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Quote not found"
      });
    }

    res.json({
      message: "Quote deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    res.status(500).json({
      error: "Could not delete quote"
    });
  }
});
module.exports = router;