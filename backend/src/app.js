const express = require('express');

const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

app.use(express.json());
app.use(
  require("morgan")(
    ':remote-addr - :remote-user - [:date[clf]] - ":method :url HTTP/:http-version" - :status - :res[content-length] B -  :response-time ms'
  )
);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.use('/api/invoices', invoiceRoutes);

module.exports = app;
