/**
 * This file contains mock data for the carrier management system.
 * In a real application, this would be replaced with actual API calls.
 */

import { v4 as uuidv4 } from "uuid";

export type Carrier = {
  id: string;
  agent_name: string;
  mc_number: string;
  us_dot_number: string;
  company_name: string;
  owner_name: string;
  phone_number: string;
  email_address: string;
  address: string;
  ein_number: string;
  truck_type: string;
  dock_height: string;
  dimensions: string;
  doors_type: string;
  door_clearance: string;
  accessories: string;
  max_weight: string;
  temp_control_range: string;
  agreed_percentage: string;
  status: "active" | "inactive" | "pending" | "suspended";
  insurance_company_name: string;
  insurance_company_address: string;
  insurance_agent_name: string;
  insurance_agent_number: string;
  insurance_agent_email: string;
  factoring_company_name: string;
  factoring_company_address: string;
  factoring_agent_name: string;
  factoring_agent_number: string;
  factoring_agent_email: string;
  notes_home_town: string;
  notes_days_working: string;
  notes_preferred_lanes: string;
  notes_additional_preferences: string;
  notes_parking_space: string;
  notes_average_gross: string;
  created_at: string;
};

// Mock carriers data
export const carriers: Carrier[] = [
  {
    id: "c1",
    agent_name: "Jane Doe",
    mc_number: "MC-123456",
    us_dot_number: "USDOT-7890123",
    company_name: "Speedy Logistics Inc.",
    owner_name: "John Smith",
    phone_number: "(555) 123-4567",
    email_address: "contact@speedylogistics.com",
    address: "123 Freight Lane, Logisticsville, CA 90210",
    ein_number: "12-3456789",
    truck_type: "Dry Van",
    dock_height: "Yes",
    dimensions: "53' x 8.5' x 9'",
    doors_type: "Swing",
    door_clearance: "8.5'",
    accessories: "Liftgate, Pallet Jack",
    max_weight: "45000 lbs",
    temp_control_range: "N/A",
    agreed_percentage: "12",
    status: "active",
    insurance_company_name: "Trucking Insurance Co.",
    insurance_company_address: "456 Coverage Blvd, Insuranceville, TX 75001",
    insurance_agent_name: "Mary Johnson",
    insurance_agent_number: "(555) 987-6543",
    insurance_agent_email: "mary@truckinsurance.com",
    factoring_company_name: "Fast Pay Factoring",
    factoring_company_address: "789 Money Lane, Finance City, NY 10001",
    factoring_agent_name: "Bob Williams",
    factoring_agent_number: "(555) 234-5678",
    factoring_agent_email: "bob@fastpayfactoring.com",
    notes_home_town: "Logisticsville, CA",
    notes_days_working: "Monday-Friday",
    notes_preferred_lanes: "East Coast, Midwest",
    notes_additional_preferences: "Prefers long hauls, no Canada routes",
    notes_parking_space: "Ample space for 53' trailer",
    notes_average_gross: "$5,000/week",
    created_at: "2023-01-15",
  },
  {
    id: "c2",
    agent_name: "Michael Johnson",
    mc_number: "MC-234567",
    us_dot_number: "USDOT-8901234",
    company_name: "Reliable Transport LLC",
    owner_name: "Maria Rodriguez",
    phone_number: "(555) 987-6543",
    email_address: "info@reliabletransport.com",
    address: "456 Carrier Ave, Trucksville, TX 75001",
    ein_number: "23-4567890",
    truck_type: "Flatbed",
    dock_height: "No",
    dimensions: "48' x 8.5' x 8.5'",
    doors_type: "N/A",
    door_clearance: "N/A",
    accessories: "Tarps, Straps, Chains",
    max_weight: "48000 lbs",
    temp_control_range: "N/A",
    agreed_percentage: "15",
    status: "active",
    insurance_company_name: "Freight Insurance Group",
    insurance_company_address: "123 Insurance Way, Coverage City, TX 75002",
    insurance_agent_name: "Tom Wilson",
    insurance_agent_number: "(555) 345-6789",
    insurance_agent_email: "twilson@freightinsurance.com",
    factoring_company_name: "Quick Cash Factoring",
    factoring_company_address: "321 Money Street, Finance Town, TX 75003",
    factoring_agent_name: "Sarah Brown",
    factoring_agent_number: "(555) 456-7890",
    factoring_agent_email: "sarah@quickcashfactoring.com",
    notes_home_town: "Trucksville, TX",
    notes_days_working: "Monday-Saturday",
    notes_preferred_lanes: "Texas to Midwest",
    notes_additional_preferences: "Prefers oversize loads",
    notes_parking_space: "Limited space, prefers drop yard",
    notes_average_gross: "$6,200/week",
    created_at: "2023-03-22",
  },
  {
    id: "c3",
    agent_name: "Robert Davis",
    mc_number: "MC-345678",
    us_dot_number: "USDOT-9012345",
    company_name: "FastTrack Carriers",
    owner_name: "Robert Johnson",
    phone_number: "(555) 456-7890",
    email_address: "dispatch@fasttrackcarriers.com",
    address: "789 Shipping Road, Freightville, GA 30301",
    ein_number: "34-5678901",
    truck_type: "Reefer",
    dock_height: "Yes",
    dimensions: "53' x 8.5' x 9.5'",
    doors_type: "Roll-up",
    door_clearance: "9'",
    accessories: "Temperature Recorder, E-Track",
    max_weight: "42000 lbs",
    temp_control_range: "-10°F to 70°F",
    agreed_percentage: "14",
    status: "active",
    insurance_company_name: "Cool Freight Insurance",
    insurance_company_address: "555 Cool Street, Iceville, GA 30302",
    insurance_agent_name: "David Miller",
    insurance_agent_number: "(555) 567-8901",
    insurance_agent_email: "david@coolfreightinsurance.com",
    factoring_company_name: "Premium Factoring Services",
    factoring_company_address: "888 Premium Ave, Serviceville, GA 30303",
    factoring_agent_name: "Jessica Lee",
    factoring_agent_number: "(555) 678-9012",
    factoring_agent_email: "jessica@premiumfactoring.com",
    notes_home_town: "Freightville, GA",
    notes_days_working: "Sunday-Thursday",
    notes_preferred_lanes: "Southeast to Northeast",
    notes_additional_preferences: "Specializes in refrigerated goods",
    notes_parking_space: "Has dedicated parking for 3 trucks",
    notes_average_gross: "$5,800/week",
    created_at: "2023-05-10",
  },
  {
    id: "c4",
    agent_name: "Emily Wilson",
    mc_number: "MC-456789",
    us_dot_number: "USDOT-0123456",
    company_name: "Temp Logistics",
    owner_name: "Carlos Sanchez",
    phone_number: "(555) 789-0123",
    email_address: "carlos@templogistics.com",
    address: "101 Temporary Road, Waitingville, FL 33101",
    ein_number: "45-6789012",
    truck_type: "Step Deck",
    dock_height: "No",
    dimensions: "53' x 8.5' x 8.5'",
    doors_type: "N/A",
    door_clearance: "N/A",
    accessories: "Ramps, Chains, Binders",
    max_weight: "48000 lbs",
    temp_control_range: "N/A",
    agreed_percentage: "13",
    status: "pending",
    insurance_company_name: "Pending Insurance Inc.",
    insurance_company_address: "222 Waiting Street, Holding City, FL 33102",
    insurance_agent_name: "Patricia Thomas",
    insurance_agent_number: "(555) 890-1234",
    insurance_agent_email: "patricia@pendinginsurance.com",
    factoring_company_name: "Awaiting Factoring LLC",
    factoring_company_address: "333 Process Ave, Review City, FL 33103",
    factoring_agent_name: "Richard Davis",
    factoring_agent_number: "(555) 901-2345",
    factoring_agent_email: "richard@awaitingfactoring.com",
    notes_home_town: "Waitingville, FL",
    notes_days_working: "Monday-Friday",
    notes_preferred_lanes: "Florida to Northeast",
    notes_additional_preferences: "No hazardous materials",
    notes_parking_space: "Has space for 1 truck only",
    notes_average_gross: "$4,800/week",
    created_at: "2023-08-15",
  },
  {
    id: "c5",
    agent_name: "William Clark",
    mc_number: "MC-567890",
    us_dot_number: "USDOT-1234567",
    company_name: "Blacklist Express",
    owner_name: "Kevin Adams",
    phone_number: "(555) 012-3456",
    email_address: "kevin@blacklistexpress.com",
    address: "555 Blocked Avenue, Restricted City, NV 89101",
    ein_number: "56-7890123",
    truck_type: "Dry Van",
    dock_height: "Yes",
    dimensions: "48' x 8.5' x 9'",
    doors_type: "Swing",
    door_clearance: "8.5'",
    accessories: "None",
    max_weight: "45000 lbs",
    temp_control_range: "N/A",
    agreed_percentage: "10",
    status: "suspended",
    insurance_company_name: "Revoked Insurance Company",
    insurance_company_address: "777 Denied Lane, Suspendedville, NV 89102",
    insurance_agent_name: "Gregory Wilson",
    insurance_agent_number: "(555) 123-4567",
    insurance_agent_email: "greg@revokedinsurance.com",
    factoring_company_name: "Terminated Factoring Inc.",
    factoring_company_address: "999 Blocked Road, Bannedtown, NV 89103",
    factoring_agent_name: "Michelle Taylor",
    factoring_agent_number: "(555) 234-5678",
    factoring_agent_email: "michelle@terminatedfactoring.com",
    notes_home_town: "Restricted City, NV",
    notes_days_working: "Irregular schedule",
    notes_preferred_lanes: "West Coast",
    notes_additional_preferences: "Multiple compliance violations",
    notes_parking_space: "Unknown",
    notes_average_gross: "$3,500/week",
    created_at: "2023-06-01",
  },
];

/**
 * Get all carriers
 * @returns Array of carriers
 */
export const getAllCarriers = () => {
  return carriers;
};

/**
 * Get a carrier by ID
 * @param id Carrier ID
 * @returns Carrier or undefined if not found
 */
export const getCarrierById = (id: string) => {
  return carriers.find((carrier) => carrier.id === id);
};

/**
 * Create a new carrier
 * @param carrierData Carrier data without id and created_at
 * @returns The created carrier with id and created_at
 */
export const createCarrier = (
  carrierData: Omit<Carrier, "id" | "created_at">
): Carrier => {
  const newCarrier: Carrier = {
    ...carrierData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };

  carriers.push(newCarrier);
  return newCarrier;
};

/**
 * Update an existing carrier
 * @param id Carrier ID to update
 * @param carrierData Updated carrier data (partial)
 * @returns Updated carrier or undefined if not found
 */
export const updateCarrier = (
  id: string,
  carrierData: Partial<Omit<Carrier, "id" | "created_at">>
): Carrier | undefined => {
  const index = carriers.findIndex((carrier) => carrier.id === id);

  if (index === -1) {
    return undefined;
  }

  carriers[index] = {
    ...carriers[index],
    ...carrierData,
  };

  return carriers[index];
};
