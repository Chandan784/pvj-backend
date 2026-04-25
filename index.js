const express = require("express");
const cors = require("cors");

const reviewRoutes = require("./routes/reviewImageRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/reviews", reviewRoutes);

// Root route (optional - for testing)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});