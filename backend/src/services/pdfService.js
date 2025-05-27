const puppeteer = require('puppeteer');
const { format } = require('date-fns');

/**
 * Generate PDF from invoice data
 * @param {Object} invoice - Invoice data with dispatch and carrier information
 * @returns {Buffer} - PDF buffer
 */
async function generateInvoicePDF(invoice) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Calculate amounts
    const totalAmount = parseFloat(invoice.total_amount);
    const carrierPercentage = parseFloat(invoice.carrier_percentage);
    const carrierAmount = parseFloat(invoice.carrier_amount);
    const profit = parseFloat(invoice.profit_amount);

    // Format dates
    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch {
        return dateString;
      }
    };

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const invoiceDate = formatDate(invoice.invoice_date);
    const dueDate = formatDate(invoice.due_date);

    // Generate HTML content matching the frontend design
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #334155;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 32px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .company-info {
          display: flex;
          align-items: center;
        }
        
        .logo {
          background: #3b82f6;
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          margin-right: 16px;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 4px;
        }
        
        .company-subtitle {
          font-size: 14px;
          color: #64748b;
        }
        
        .invoice-title {
          text-align: right;
        }
        
        .invoice-title h1 {
          font-size: 32px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        .invoice-number {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .content {
          padding: 48px;
        }
        
        .dates-status {
          display: flex;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        
        .date-item, .status-item {
          text-align: center;
        }
        
        .date-label, .status-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .date-value, .status-value {
          font-size: 18px;
          font-weight: 600;
        }
        
        .status-badge {
          background: #fef3c7;
          color: #d97706;
          padding: 4px 12px;
          border-radius: 16px;
          border: 1px solid #fde68a;
          font-size: 14px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        
        .info-section {
          padding: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .carrier-info {
          background: #f8fafc;
        }
        
        .customer-info {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        
        .info-title {
          font-size: 12px;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        
        .info-item {
          margin-bottom: 16px;
        }
        
        .info-item-title {
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        .info-item-subtitle {
          font-size: 14px;
          color: #64748b;
        }
        
        .route-section {
          background: #f8fafc;
          padding: 24px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        
        .route-point {
          display: flex;
          align-items: center;
        }
        
        .route-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 12px;
        }
        
        .origin-icon {
          background: #3b82f6;
        }
        
        .destination-icon {
          background: #374151;
        }
        
        .route-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .route-location {
          font-weight: 600;
        }
        
        .route-line {
          flex: 1;
          height: 2px;
          background: #3b82f6;
          margin: 0 24px;
          position: relative;
        }
        
        .route-line::before,
        .route-line::after {
          content: '';
          position: absolute;
          top: -3px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }
        
        .route-line::before {
          left: 0;
        }
        
        .route-line::after {
          right: 0;
        }
        
        .service-details {
          margin-bottom: 48px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 24px;
        }
        
        .service-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        
        .service-table th {
          background: #f8fafc;
          padding: 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .service-table th:last-child {
          text-align: right;
        }
        
        .service-table td {
          padding: 24px 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .service-table td:last-child {
          text-align: right;
          font-weight: 600;
        }
        
        .load-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .bol-number {
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
          margin-top: 4px;
        }
        
        .service-table tfoot tr {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .service-table tfoot td {
          padding: 16px;
          font-weight: 600;
        }
        
        .total-row td {
          font-size: 16px;
          font-weight: bold;
          color: #1e293b;
        }
        
        .total-row td:last-child {
          color: #3b82f6;
        }
        
        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        
        .payment-section {
          padding: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .payment-info {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        
        .thank-you {
          background: #f8fafc;
        }
        
        .payment-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
        }
        
        .payment-title::before {
          content: '💳';
          margin-right: 8px;
        }
        
        .payment-details {
          margin-bottom: 16px;
        }
        
        .payment-item {
          display: flex;
          margin-bottom: 12px;
        }
        
        .payment-label {
          width: 60px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
        }
        
        .payment-value {
          font-size: 14px;
        }
        
        .payment-note {
          font-size: 12px;
          color: #64748b;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 2px dashed #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
          
          .invoice-container {
            border: none;
            box-shadow: none;
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <div class="logo">HC</div>
            <div>
              <div class="company-name">HAUL CONNECT</div>
              <div class="company-subtitle">LOGISTICS LLC</div>
            </div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <div class="invoice-number">${invoice.invoice_number}</div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="content">
          <!-- Status and Dates -->
          <div class="dates-status">
            <div class="date-item">
              <div class="date-label">📅 ISSUE DATE</div>
              <div class="date-value">${invoiceDate}</div>
            </div>
            <div class="date-item">
              <div class="date-label">📅 DUE DATE</div>
              <div class="date-value">${dueDate}</div>
            </div>
            <div class="status-item">
              <div class="status-label">📋 STATUS</div>
              <div class="status-badge">${invoice.status.toUpperCase()}</div>
            </div>
          </div>

          <!-- Client and Service Information -->
          <div class="info-grid">
            <!-- Carrier Info -->
            <div class="info-section carrier-info">
              <div class="info-title">Carrier Information</div>
              <div class="info-item">
                <div class="info-item-title">🚛 ${invoice.dispatch.carrier?.company_name || 'N/A'}</div>
                <div class="info-item-subtitle">MC#: ${invoice.dispatch.carrier?.mc_number || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-item-subtitle">📍 ${invoice.dispatch.origin}</div>
              </div>
              <div class="info-item">
                <div class="info-item-subtitle">📞 ${invoice.dispatch.carrier?.phone_number || 'N/A'}</div>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="info-section customer-info">
              <div class="info-title">Customer Information</div>
              <div class="info-item">
                <div class="info-item-title">HAUL CONNECT CUSTOMER</div>
                <div class="info-item-subtitle">Customer Address Line</div>
              </div>
              <div class="info-item">
                <div class="info-item-subtitle">📞 Customer Phone</div>
              </div>
              <div class="info-item">
                <div class="info-item-subtitle">✉️ customer@email.com</div>
              </div>
            </div>
          </div>

          <!-- Route Details -->
          <div class="route-section">
            <div class="route-point">
              <div class="route-icon origin-icon">📍</div>
              <div>
                <div class="route-label">Origin</div>
                <div class="route-location">${invoice.dispatch.origin}</div>
              </div>
            </div>
            <div class="route-line"></div>
            <div class="route-point">
              <div>
                <div class="route-label">Destination</div>
                <div class="route-location">${invoice.dispatch.destination}</div>
              </div>
              <div class="route-icon destination-icon">📍</div>
            </div>
          </div>

          <!-- Service Details Table -->
          <div class="service-details">
            <div class="section-title">Service Details</div>
            <table class="service-table">
              <thead>
                <tr>
                  <th>Pickup Date</th>
                  <th>Delivery Date</th>
                  <th>Load Number</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${formatDate(invoice.dispatch.pickup_date)}</td>
                  <td>${formatDate(invoice.dispatch.dropoff_date)}</td>
                  <td><span class="load-badge">${invoice.dispatch.load_no}</span></td>
                  <td>
                    <div>Freight transportation services from ${invoice.dispatch.origin} to ${invoice.dispatch.destination}</div>
                    <div class="bol-number">BOL #: ${invoice.dispatch.load_no}</div>
                  </td>
                  <td>${formatCurrency(totalAmount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">Subtotal</td>
                  <td>${formatCurrency(totalAmount)}</td>
                </tr>
                <tr>
                  <td colspan="4">Carrier Payment (${carrierPercentage}%)</td>
                  <td>-${formatCurrency(carrierAmount)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4">Net Profit</td>
                  <td>${formatCurrency(profit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Information -->
          <div class="payment-grid">
            <div class="payment-section payment-info">
              <div class="payment-title">Payment Method</div>
              <div class="payment-details">
                <div class="payment-item">
                  <div class="payment-label">Zelle:</div>
                  <div class="payment-value">info@haulconnectlogistics.com</div>
                </div>
                <div class="payment-item">
                  <div class="payment-label">Email:</div>
                  <div class="payment-value">haulconnect@gmail.com</div>
                </div>
              </div>
              <div class="payment-note">
                Please include invoice number ${invoice.invoice_number} as reference when making payment
              </div>
            </div>

            <div class="payment-section thank-you">
              <div class="payment-title" style="margin-bottom: 24px;">Thank You for Your Business</div>
              <div style="font-size: 14px; color: #64748b;">
                <p style="margin-bottom: 12px;">
                  We appreciate your prompt payment within 30 days of receipt.
                </p>
                <p>
                  If you have any questions concerning this invoice, please contact our billing 
                  department at haulconnect@gmail.com.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            HAUL CONNECT LOGISTICS LLC | www.haulconnectlogistics.com
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoicePDF };
