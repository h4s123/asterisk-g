const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
// const trunkRoutes = require("./routes/trunkRoutes");
const recordingRoutes = require("./routes/recordingRoutes"); // Import recording routes

require("./ari/ari-connection");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/trunks", trunkRoutes);
app.use("/api/recordings", recordingRoutes); // Add recording routes

// Handle errors for invalid file combinations
app.use((err, req, res, next) => {
  if (err.message === "Invalid file combination") {
    return res.status(400).json({
      message:
        "Please upload either a recording or a text-to-speech file, but not both.",
    });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
