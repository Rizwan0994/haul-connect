const express = require("express");
const cors = require("cors");
const { authenticateToken } = require("./middleware/auth");

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

// Import routes
const authRoutes = require('./routes/authRoutes');
const carrierRoutes = require('./routes/carrierRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const notificationRoutes = require('./routes/notification.routes');
const profileRoutes = require('./routes/profile');

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/carriers', authenticateToken, carrierRoutes);
app.use('/api/dispatches', authenticateToken, dispatchRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', profileRoutes); // Profile routes
module.exports = app;