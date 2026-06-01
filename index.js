require("dotenv").config();

const express = require("express");
const cors = require("cors");

const reviewRoutes = require("./routes/reviewImageRoutes");

const destinationRoutes = require("./routes/destinationRoutes");
const packageRoutes = require("./routes/packageRoutes");
const packageDetailsRoutes = require("./routes/packageDeatilsRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://primevistajourney.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/reviews", reviewRoutes);

app.use("/api/destinations", destinationRoutes);

app.use("/api/packages", packageRoutes);

app.use("/api/package-details", packageDetailsRoutes);
app.use("/api/auth", authRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Travel API Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
