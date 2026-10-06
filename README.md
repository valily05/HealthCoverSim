# HealthCoverSim

## Private Health Insurance Quote Simulator

HealthCoverSim is a full-stack web application that simulates a private health insurance quote system.

The application allows users to create, view, edit, update, and delete health insurance quotes. It calculates estimated monthly and yearly premiums based on the selected cover type, hospital cover, extras cover, applicant information, Lifetime Health Cover (LHC) loading, Family upgrade fee, and annual-payment discount.

> **Note:** HealthCoverSim is a learning simulator only. It is not financial advice and its pricing does not represent the pricing of any real health insurer.

---

## Features

- Create a new health insurance quote
- Select Single, Couple, or Family cover
- Enter applicant ages and hospital cover history
- Select hospital cover
- Select extras cover
- Choose Monthly or Yearly payment
- Apply an annual-payment discount from 0–10%
- Calculate monthly and yearly premiums
- Display a detailed quote breakdown
- Show LHC loading for each applicant
- Warn users when hospital cover history is "Not sure"
- Automatically apply the Family upgrade fee
- Save quotes to SQLite
- View saved quotes
- Edit and update existing quotes
- Delete saved quotes
- Validate user input on the frontend and backend

---

## Technologies

### Frontend

- React
- JavaScript
- React Router
- Vite
- CSS

### Backend

- Node.js
- Express.js
- CORS

### Database

- SQLite
- better-sqlite3

---


# Installation and Setup

## 1. Clone the Repository


git clone https://github.com/valily05/HealthCoverSim.git
cd HealthCoverSim


## 2. Install Dependencies

Install the frontend dependencies:


cd client
npm install


Then install the backend dependencies:


cd ../server
npm install


---

# Running the Application

The frontend and backend need to run at the same time.

## Start the Backend

From the `server` folder:


npm start


The backend runs on:


http://localhost:3001


You can check that the API is running by opening:


http://localhost:3001/api/health


## Start the Frontend

Open a **second terminal** and navigate to the frontend:


cd client
npm run dev


Vite will display the local development URL in the terminal.

Open the provided URL in your browser.

---

# Database Setup

HealthCoverSim uses SQLite to store saved quote records.

The backend includes `init.sql` and `db.js` for database setup and access.

The database stores information including:

- Customer name
- Cover type
- Applicant 1 age
- Applicant 1 hospital cover history
- Applicant 2 age
- Applicant 2 hospital cover history
- Hospital cover
- Extras cover
- Payment frequency
- Annual discount
- Notes
- Created and updated timestamps

For Single cover, Applicant 2 fields are stored as `NULL`.

The SQLite database allows saved quotes to persist between application sessions.

---

# Quote Calculation

HealthCoverSim calculates hospital and extras premiums separately.

All base prices are per adult per month.

## Hospital Cover

| Hospital Cover | Price per Adult / Month |
|---|---:|
| None | $0 |
| Basic | $90 |
| Bronze | $120 |
| Silver | $160 |
| Gold | $220 |

## Extras Cover

| Extras Cover | Price per Adult / Month |
|---|---:|
| None | $0 |
| Basic | $25 |
| Standard | $45 |
| Premium | $70 |

## Cover Types

### Single

1 adult is counted.

### Couple

2 adults are counted.

### Family

2 adults are counted, plus a $30/month Family upgrade fee.

Children are not counted individually.

There is no separate Couple or Family discount.

---

# Lifetime Health Cover (LHC) Loading

LHC loading applies only to the hospital component of the quote.

It does not apply to extras cover.

The application displays:

> "Lifetime Health Cover loading applies only to hospital cover. It does not apply to extras cover."

### LHC Rules

If the applicant has had hospital cover before:


LHC loading = 0%


If the applicant selects "No" for previous hospital cover and is older than 30:


LHC loading = (age - 30) × 2%


If the applicant is 30 or younger:


LHC loading = 0%


If the applicant selects "Not sure":


LHC loading = 0%


A warning is displayed because the quote may be inaccurate.

If hospital cover is "None", no LHC loading is applied.

For Couple and Family cover, LHC loading is calculated separately for each applicant.

---

# Premium Formula

### Hospital Premium


Hospital premium
= Hospital tier price × (1 + LHC loading)


The hospital premiums for all applicable adults are then added together.

### Extras Premium


Extras premium
= Extras tier price × Number of adults


### Family Upgrade Fee


Family = $30/month
Single/Couple = $0


### Monthly Premium


Monthly premium
= Hospital total
+ Extras total
+ Family upgrade fee


### Yearly Premium Before Discount


Yearly before discount
= Monthly premium × 12


### Yearly Premium After Discount

The annual discount is only applied when Yearly payment is selected.


Yearly after discount
= Yearly before discount × (1 - annual discount)


Monthly payment does not receive the annual-payment discount.

---

# Worked Example

Example input:


Cover type: Family

Applicant 1:
Age: 40
Hospital cover history: No

Applicant 2:
Age: 35
Hospital cover history: Yes

Hospital cover: Silver
Extras cover: Standard
Payment: Yearly
Annual discount: 5%


Applicant 1:


LHC loading = (40 - 30) × 2%
             = 20%

$160 × 1.20
= $192


Applicant 2:


LHC loading = 0%

$160 × 1.00
= $160


Hospital total:


$192 + $160 = $352


Extras total:


$45 × 2 = $90


Family upgrade fee:


$30


Monthly premium:


$352 + $90 + $30 = $472


Yearly premium before discount:


$472 × 12 = $5,664


Yearly premium after 5% discount:


$5,664 × 0.95 = $5,380.80


---

# Quote Validation

The application validates quote information before calculating and saving a quote.

Validation includes:

- Customer name is required
- Cover type must be Single, Couple, or Family
- Applicant ages must be between 18 and 100
- Applicant 1 hospital cover history is required
- Applicant 2 information is required for Couple and Family cover
- Hospital cover must be a valid option
- Extras cover must be a valid option
- Payment frequency must be Monthly or Yearly
- Annual discount must be between 0% and 10%
- Annual discount is only applied when Yearly payment is selected
- Invalid backend requests return meaningful error messages

Applicant 2 fields are only displayed when Couple or Family cover is selected.

---

# CRUD Functionality

HealthCoverSim implements full CRUD functionality.

### Create

Users can create and save a new health insurance quote.

### Read

Users can:

- View their saved quotes
- View individual quote details
- View the calculated premium breakdown

### Update

Users can select **Edit** from My Quotes.

The existing quote information is loaded into the quote form. Users can modify the information and select **Update Quote** to update the existing database record.

The application updates the existing quote instead of creating a duplicate quote.

### Delete

Users can delete saved quotes from the My Quotes page.

---

# API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check whether the API is running |
| GET | `/api/quotes` | Retrieve all quotes |
| GET | `/api/quotes/:id` | Retrieve a quote by ID |
| POST | `/api/quotes` | Create a new quote |
| PUT | `/api/quotes/:id` | Update an existing quote |
| DELETE | `/api/quotes/:id` | Delete a quote |

---

# Explanation Sheet

For each quote, HealthCoverSim provides a clear breakdown including:

- Estimated monthly premium
- Yearly premium before discount
- Yearly premium after discount when applicable
- Hospital premium
- Extras premium
- LHC loading for each applicant
- Family upgrade fee when applicable
- Annual-payment discount
- Warnings for unknown hospital cover history
- Explanation of how the quote was calculated
- Required LHC statement

---

# AI Use Statement

AI tools were used during development as a supporting tool for:

- Understanding React, Express, and SQLite concepts
- Debugging frontend and backend errors
- Troubleshooting API and CRUD functionality
- Improving UI implementation
- Assisting with README documentation
- Brainstorming validation and user interface improvements

I personally reviewed, tested, and implemented the application code and quote calculation logic.

I made decisions about the application's structure, user interface, validation behaviour, quote editing workflow, and how the frontend communicates with the Express API.

AI-generated suggestions were checked against the assignment requirements and the application's actual implementation before being used.

---

# Limitation

HealthCoverSim is a simplified educational simulator and does not represent the actual pricing rules of a real private health insurer.

For example, the LHC calculation is simplified to:


(age - 30) × 2%


and does not implement all real-world LHC rules, caps, or exemptions.

Therefore, the estimates produced by HealthCoverSim should not be used as real financial or insurance advice.

---

# Author

Valencia

Business Information Systems  
BINUS University International

HealthCoverSim  
Semester 2, 2026
