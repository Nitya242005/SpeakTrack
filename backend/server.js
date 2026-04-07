
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// create express app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/audio", require("./routes/textRoutes"));
app.use("/api/grammar", require("./routes/grammarRoutes"));



// test route
app.get('/', (req, res) => {
  res.send("Backend is running...");
});

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


