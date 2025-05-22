const express = require("express");
const cors = require("cors");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

// Allow access from all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(
  require("morgan")(
    ':remote-addr - :remote-user - [:date[clf]] - ":method :url HTTP/:http-version" - :status - :res[content-length] B -  :response-time ms',
  ),
);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/invoices", invoiceRoutes);

module.exports = app;
