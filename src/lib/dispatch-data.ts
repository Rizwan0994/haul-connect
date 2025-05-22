import { v4 as uuidv4 } from "uuid";

// Mock dispatch data
export type Dispatch = {
  id: string;
  user: string;
  department: string;
  booking_date: string; // ISO date string
  load_no: string;
  pickup_date: string; // ISO date string
  dropoff_date: string; // ISO date string
  carrier: string;
  origin: string;
  destination: string;
  brokerage_company: string;
  brokerage_agent: string;
  agent_ph: string;
  agent_email: string;
  load_amount: number;
  charge_percent: number;
  status: "Scheduled" | "In Transit" | "Delivered" | "Cancelled";
  payment: string;
  dispatcher: string;
  invoice_status:
    | "Not Sent"
    | "Invoice Sent"
    | "Invoice Pending"
    | "Invoice Cleared";
  payment_method: "ACH" | "ZELLE" | "OTHER";
  created_at: string; // ISO date string
};

// Sample dispatches
const dispatches: Dispatch[] = [
  {
    id: "1",
    user: "John Doe",
    department: "Dispatch",
    booking_date: "2023-10-01T10:30:00Z",
    load_no: "LD12345",
    pickup_date: "2023-10-03T08:00:00Z",
    dropoff_date: "2023-10-05T17:00:00Z",
    carrier: "ABC Trucking",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    brokerage_company: "XYZ Brokers",
    brokerage_agent: "Mike Smith",
    agent_ph: "(555) 123-4567",
    agent_email: "mike@xyzbrokers.com",
    load_amount: 2500,
    charge_percent: 12,
    status: "Delivered",
    payment: "Paid",
    dispatcher: "Jane Wilson",
    invoice_status: "Invoice Cleared",
    payment_method: "ACH",
    created_at: "2023-10-01T10:30:00Z",
  },
  {
    id: "2",
    user: "Sarah Johnson",
    department: "Sales",
    booking_date: "2023-10-10T14:15:00Z",
    load_no: "LD12346",
    pickup_date: "2023-10-12T09:00:00Z",
    dropoff_date: "2023-10-14T16:00:00Z",
    carrier: "Quick Transit LLC",
    origin: "Chicago, IL",
    destination: "Indianapolis, IN",
    brokerage_company: "Midwest Logistics",
    brokerage_agent: "Tom Brown",
    agent_ph: "(555) 987-6543",
    agent_email: "tom@midwestlogistics.com",
    load_amount: 1800,
    charge_percent: 10,
    status: "In Transit",
    payment: "Pending",
    dispatcher: "Alex Rodriguez",
    invoice_status: "Invoice Sent",
    payment_method: "ZELLE",
    created_at: "2023-10-10T14:15:00Z",
  },
  {
    id: "3",
    user: "Robert Chen",
    department: "Dispatch",
    booking_date: "2023-10-15T11:45:00Z",
    load_no: "LD12347",
    pickup_date: "2023-10-18T07:30:00Z",
    dropoff_date: "2023-10-20T15:00:00Z",
    carrier: "Eagle Transport",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    brokerage_company: "Northwest Freight",
    brokerage_agent: "Lisa Wong",
    agent_ph: "(555) 222-3333",
    agent_email: "lisa@northwestfreight.com",
    load_amount: 1200,
    charge_percent: 8,
    status: "Scheduled",
    payment: "Not Paid",
    dispatcher: "David Miller",
    invoice_status: "Not Sent",
    payment_method: "ACH",
    created_at: "2023-10-15T11:45:00Z",
  },
  {
    id: "4",
    user: "Emily Garcia",
    department: "Sales",
    booking_date: "2023-10-20T09:00:00Z",
    load_no: "LD12348",
    pickup_date: "2023-10-23T10:00:00Z",
    dropoff_date: "2023-10-25T18:00:00Z",
    carrier: "Reliable Shipping Inc",
    origin: "Miami, FL",
    destination: "Atlanta, GA",
    brokerage_company: "Southern Routes",
    brokerage_agent: "James Wilson",
    agent_ph: "(555) 444-5555",
    agent_email: "james@southernroutes.com",
    load_amount: 3200,
    charge_percent: 15,
    status: "Scheduled",
    payment: "Not Paid",
    dispatcher: "Patricia Lopez",
    invoice_status: "Not Sent",
    payment_method: "OTHER",
    created_at: "2023-10-20T09:00:00Z",
  },
  {
    id: "5",
    user: "Michael Taylor",
    department: "Dispatch",
    booking_date: "2023-10-05T13:30:00Z",
    load_no: "LD12349",
    pickup_date: "2023-10-08T08:30:00Z",
    dropoff_date: "2023-10-10T19:00:00Z",
    carrier: "Fast Delivery Co",
    origin: "Dallas, TX",
    destination: "Houston, TX",
    brokerage_company: "Texas Logistics",
    brokerage_agent: "Frank Martinez",
    agent_ph: "(555) 777-8888",
    agent_email: "frank@texaslogistics.com",
    load_amount: 1500,
    charge_percent: 9,
    status: "Delivered",
    payment: "Paid",
    dispatcher: "Nancy Robinson",
    invoice_status: "Invoice Cleared",
    payment_method: "ACH",
    created_at: "2023-10-05T13:30:00Z",
  },
];

// Get all dispatches
export const getAllDispatches = (): Dispatch[] => {
  return dispatches;
};

// Get dispatch by ID
export const getDispatchById = (id: string): Dispatch | undefined => {
  return dispatches.find((dispatch) => dispatch.id === id);
};

// Create new dispatch
export const createDispatch = (
  dispatchData: Omit<Dispatch, "id" | "created_at">
): Dispatch => {
  const newDispatch: Dispatch = {
    ...dispatchData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };

  dispatches.push(newDispatch);
  return newDispatch;
};

// Update dispatch
export const updateDispatch = (
  id: string,
  dispatchData: Partial<Omit<Dispatch, "id" | "created_at">>
): Dispatch | undefined => {
  const index = dispatches.findIndex((dispatch) => dispatch.id === id);

  if (index === -1) {
    return undefined;
  }

  dispatches[index] = {
    ...dispatches[index],
    ...dispatchData,
  };

  return dispatches[index];
};

// Delete dispatch
export const deleteDispatch = (id: string): boolean => {
  const index = dispatches.findIndex((dispatch) => dispatch.id === id);

  if (index === -1) {
    return false;
  }

  dispatches.splice(index, 1);
  return true;
};

// Filter dispatches by status
export const getDispatchesByStatus = (
  status: Dispatch["status"]
): Dispatch[] => {
  return dispatches.filter((dispatch) => dispatch.status === status);
};

// TODO: In a real application, this would be replaced with actual API calls to:
// 1. Auto-populate username from logged-in user
// 2. Set default department to "Dispatch"
// 3. Auto-populate dispatcher name
// 4. Fetch charge percentage from carrier profile
// 5. Track commission for both sales and dispatch personnel
