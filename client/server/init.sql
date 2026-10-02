CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    cover_type TEXT NOT NULL,
    applicant1_age INTEGER NOT NULL,
    applicant1_previous_cover TEXT NOT NULL,
    applicant2_age INTEGER,
    applicant2_previous_cover TEXT,
    hospital_cover TEXT NOT NULL,
    extras_cover TEXT NOT NULL,
    payment_frequency TEXT NOT NULL,
    annual_discount REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);