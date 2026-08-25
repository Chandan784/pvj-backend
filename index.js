require("dotenv").config();

const express = require("express");
const cors = require("cors");

const reviewRoutes = require("./routes/reviewImageRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const packageRoutes = require("./routes/packageRoutes");
const packageDetailsRoutes = require("./routes/packageDeatilsRoutes");
const authRoutes = require("./routes/authRoutes");
const heroSliderRoutes = require("./routes/heroSliderRoutes");

const app = express();

// CORS Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://primevistajourney.com",
  "https://www.primevistajourney.com",
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman or server-to-server requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/reviews", reviewRoutes);
app.use("/api/heroSliders", heroSliderRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/package-details", packageDetailsRoutes);
app.use("/api/auth", authRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Travel API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});