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
const brokerRoutes = require('./routes/brokerRoutes');
const shipperRoutes = require('./routes/shipperRoutes');
const consigneeRoutes = require('./routes/consigneeRoutes');

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
app.use('/api/brokers', authenticateToken, brokerRoutes);
app.use('/api/shippers', authenticateToken, shipperRoutes);
app.use('/api/consignees', authenticateToken, consigneeRoutes);
app.use('/api/smtp-settings', smtpRoutes);
app.use('/api/profile', profileRoutes); // Profile routes

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Catch-all handler: send back React's index.html file for any non-API routes
// Use Express 5.x compatible syntax - avoid /api routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
});
module.exports = app;