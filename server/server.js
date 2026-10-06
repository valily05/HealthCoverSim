const express = require("express");
const cors = require("cors");
const quotesRouter = require("./routes/quotes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "HealthCoverSim API is running"
  });
});

app.use("/api/quotes", quotesRouter);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});