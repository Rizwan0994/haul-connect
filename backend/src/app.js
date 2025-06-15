const express = require("express");
const cors = require("cors");
const path = require("path");
const { authenticateToken } = require("./middleware/auth");

const app = express();

// Allow access from all origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
const carrierApprovalRoutes = require('./routes/carrierApprovalRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const dispatchApprovalRoutes = require('./routes/dispatchApprovalRoutes');
const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const notificationRoutes = require('./routes/notification.routes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoutes = require('./routes/profile');
const followupSheetRoutes = require('./routes/followupSheetRoutes');
const smtpRoutes = require('./routes/smtpRoutes');

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/carriers', authenticateToken, carrierRoutes);
app.use('/api/carrier-approvals', authenticateToken, carrierApprovalRoutes);
app.use('/api/dispatches', authenticateToken, dispatchRoutes);
app.use('/api/dispatch-approvals', authenticateToken, dispatchApprovalRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/followup-sheets', authenticateToken, followupSheetRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/smtp-settings', smtpRoutes);
app.use('/api', profileRoutes); // Profile routes
module.exports = app;