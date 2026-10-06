# HealthCoverSim

## Private Health Insurance Quote Simulator

HealthCoverSim is a full-stack web application that simulates a private health insurance quote system.

The application allows users to create, view, edit, update, and delete health insurance quotes. It calculates estimated monthly and yearly premiums based on the selected cover type, hospital cover, extras cover, applicant information, Lifetime Health Cover (LHC) loading, Family upgrade fee, and annual-payment discount.


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

## Project Structure


HealthCoverSim/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   │   └── quotes.js
│   ├── db.js
│   ├── init.sql
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
└── README.md
