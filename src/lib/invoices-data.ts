import { v4 as uuidv4 } from "uuid";

// This type is used to define the shape of our invoice data.
export type Invoice = {
  id: string;
  invoice_number: string;
  carrier_name: string; // Or driver name, depending on your data structure
  date: string; // Changed from invoice_date to date to match dummy data structure
  amount: number; // Changed from string to number to match dummy data structure
  status: "Paid" | "Unpaid" | "Draft";
  // Add other relevant invoice fields here
};

// Mock invoices data
const invoices: Invoice[] = [
  {
    id: "1",
    invoice_number: "INV-001",
    carrier_name: "Carrier A",
    date: "2023-10-26",
    amount: 1500,
    status: "Unpaid",
  },
  {
    id: "2",
    invoice_number: "INV-002",
    carrier_name: "Driver B",
    date: "2023-10-25",
    amount: 800,
    status: "Paid",
  },
  {
    id: "3",
    invoice_number: "INV-003",
    carrier_name: "Carrier C",
    date: "2023-10-24",
    amount: 2200,
    status: "Unpaid",
  },
  {
    id: "inv-004",
    invoice_number: "INV-004",
    carrier_name: "Carrier D",
    date: "2023-10-23",
    amount: 1200,
    status: "Unpaid",
  },
  {
    id: "inv-005",
    invoice_number: "INV-005",
    carrier_name: "Driver E",
    date: "2023-10-22",
    amount: 950,
    status: "Paid",
  },
  {
    id: "inv-006",
    invoice_number: "INV-006",
    carrier_name: "Carrier F",
    date: "2023-10-21",
    amount: 3000,
    status: "Unpaid",
  },
];

/**
 * Get all invoices
 * @returns Array of invoices
 */
export const getAllInvoices = (): Invoice[] => {
  return invoices;
};

/**
 * Get an invoice by ID
 * @param id Invoice ID
 * @returns Invoice or undefined if not found
 */
export const getInvoiceById = (id: string): Invoice | undefined => {
  return invoices.find((invoice) => invoice.id === id);
};