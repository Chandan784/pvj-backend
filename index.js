require("dotenv").config();

const express = require("express");
const cors = require("cors");

const reviewRoutes = require("./routes/reviewImageRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const packageRoutes = require("./routes/packageRoutes");
const packageDetailsRoutes = require("./routes/packageDeatilsRoutes");
const authRoutes = require("./routes/authRoutes");
const heroSliderRoutes = require("./routes/heroSliderRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const customerRoutes = require("./routes/customerRoutes")
const bookingRoutes = require("./routes/bookingRoutes");



const app = express();

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://travdigit.applutetech.com",
      "https://www.travdigit.applutetech.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);




// ===============================
// Body Parser
// ===============================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===============================
// Routes
// ===============================

app.use("/api/reviews", reviewRoutes);
app.use(
  "/api/enquiries",
  enquiryRoutes
);

app.use("/api/heroSliders", heroSliderRoutes);

app.use("/api/destinations", destinationRoutes);

app.use("/api/packages", packageRoutes);

app.use("/api/package-details", packageDetailsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api/bookings", bookingRoutes);

// ===============================
// Root Route
// ===============================

app.get("/", (req, res) => {
  res.send("Travel API Running...");
});

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});