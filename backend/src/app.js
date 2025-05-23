const express = require("express");
const cors = require("cors");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

// Allow access from all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use(
  require("morgan")(
    ':remote-addr - :remote-user - [:date[clf]] - ":method :url HTTP/:http-version" - :status - :res[content-length] B -  :response-time ms',
  ),
);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

const authRoutes = require('./routes/authRoutes');
const carrierRoutes = require('./routes/carrierRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/carriers', carrierRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/invoices', invoiceRoutes);
module.exports = app;