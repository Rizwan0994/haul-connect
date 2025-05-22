# Logistics & Carrier Management System

## Overview

This is a comprehensive logistics and carrier management system built for freight brokers and dispatchers. The system allows for management of carrier profiles, dispatches, loads, and user accounts.


## Database Schema

### Carrier Profiles

The `carrier_profiles` table tracks detailed information about carriers including:

| Field                          | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| `id`                           | Primary key                                          |
| `agent_name`                   | Name of the agent who managed this carrier profile   |
| `mc_number`                    | Motor Carrier number                                 |
| `us_dot_number`                | US Department of Transportation number               |
| `company_name`                 | Name of the carrier company                          |
| `owner_name`                   | Name of the company owner                            |
| `phone_number`                 | Contact phone number                                 |
| `email_address`                | Email address                                        |
| `address`                      | Physical address                                     |
| `ein_number`                   | Employer Identification Number                       |
| `truck_type`                   | Type of truck (Box Truck, Hotshot, Dry Van, etc.)    |
| `dock_height`                  | Whether the truck has dock height (Yes/No)           |
| `dimensions`                   | Dimensions of the truck                              |
| `doors_type`                   | Type of doors (Roll up, Swing, etc.)                 |
| `door_clearance`               | Door clearance measurements                          |
| `accessories`                  | Available accessories (lift gate, pallet jack, etc.) |
| `max_weight`                   | Maximum weight capacity                              |
| `temp_control_range`           | Temperature control range for refrigerated vehicles  |
| `agreed_percentage`            | Agreed commission percentage                         |
| `insurance_company_name`       | Name of the insurance company                        |
| `insurance_company_address`    | Address of the insurance company                     |
| `insurance_agent_name`         | Name of the insurance agent                          |
| `insurance_agent_number`       | Phone number of the insurance agent                  |
| `insurance_agent_email`        | Email of the insurance agent                         |
| `factoring_company_name`       | Name of the factoring company                        |
| `factoring_company_address`    | Address of the factoring company                     |
| `factoring_agent_name`         | Name of the factoring agent                          |
| `factoring_agent_number`       | Phone number of the factoring agent                  |
| `factoring_agent_email`        | Email of the factoring agent                         |
| `notes_home_town`              | Home town notes                                      |
| `notes_days_working`           | Number of working days                               |
| `notes_preferred_lanes`        | Preferred routes/lanes                               |
| `notes_additional_preferences` | Additional preferences                               |
| `notes_parking_space`          | Parking space notes                                  |
| `notes_average_gross`          | Average gross earnings                               |
| `office_use_carrier_no`        | Carrier number for office use                        |
| `office_use_team_assigned`     | Team assigned for office use                         |
| `office_use_special_notes`     | Special notes for office use                         |
| `attachments`                  | File attachments (insurance certificates, W-9, etc.) |
| `created_at`                   | Date and time of creation                            |

### Dispatches

The `dispatches` table tracks information about dispatched loads:

| Field               | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `id`                | Primary key                                                               |
| `user`              | User who created the dispatch                                             |
| `department`        | Department handling the dispatch                                          |
| `booking_date`      | Date the load was booked                                                  |
| `load_no`           | Load number                                                               |
| `pickup_date`       | Date for pickup                                                           |
| `dropoff_date`      | Date for delivery                                                         |
| `carrier`           | Carrier assigned to the load                                              |
| `origin`            | Origin location                                                           |
| `destination`       | Destination location                                                      |
| `brokerage_company` | Brokerage company name                                                    |
| `brokerage_agent`   | Brokerage agent name                                                      |
| `agent_ph`          | Agent phone number                                                        |
| `agent_email`       | Agent email                                                               |
| `load_amount`       | Total amount for the load                                                 |
| `charge_percent`    | Charge percentage                                                         |
| `status`            | Current status of the dispatch                                            |
| `payment`           | Payment information                                                       |
| `dispatcher`        | Dispatcher name                                                           |
| `invoice_status`    | Status of the invoice (Invoice just sent/Invoice Pending/Invoice Cleared) |
| `payment_method`    | Method of payment                                                         |
| `created_at`        | Date and time of creation                                                 |

### Dispatch Loads

The `dispatch_loads` table tracks more detailed information about loads:

| Field              | Description                                         |
| ------------------ | --------------------------------------------------- |
| `id`               | Primary key                                         |
| `dispatcher`       | Name of the dispatcher                              |
| `client`           | Client name                                         |
| `company`          | Company name                                        |
| `equipment`        | Equipment used (Dry Van, Reefer, Flatbed, etc.)     |
| `pickup_date`      | Date for pickup                                     |
| `pickup_location`  | Location for pickup                                 |
| `dropoff_date`     | Date for delivery                                   |
| `dropoff_location` | Location for delivery                               |
| `rate`             | Rate for the load                                   |
| `percentage`       | Commission percentage                               |
| `invoice_amount`   | Amount to be invoiced                               |
| `load_number`      | Unique load number                                  |
| `broker_company`   | Broker company name                                 |
| `broker_agent`     | Broker agent name                                   |
| `agent_contact`    | Agent contact information                           |
| `payment_method`   | Method of payment                                   |
| `payment_status`   | Payment status (Paid/Pending/Not Paid)              |
| `load_status`      | Status of the load (Scheduled/In Transit/Delivered) |
| `invoice_status`   | Status of the invoice (Draft/Sent/Paid)             |
| `remarks`          | Additional remarks                                  |
| `created_at`       | Date and time of creation                           |
| `updated_at`       | Date and time of last update                        |

### Followup Sheets

The `followup_sheets` table tracks follow-up interactions with carriers:

| Field             | Description            |
| ----------------- | ---------------------- |
| `id`              | Primary key            |
| `agent_name`      | Name of the agent      |
| `date`            | Date of the follow-up  |
| `name`            | Name of the contact    |
| `mc_no`           | Motor Carrier number   |
| `contact`         | Contact information    |
| `email`           | Email address          |
| `truck_type`      | Type of truck          |
| `preferred_lanes` | Preferred routes/lanes |
| `equipment`       | Equipment details      |
| `zip_code`        | ZIP code               |
| `percentage`      | Commission percentage  |
| `comments`        | Additional comments    |

### Users

The `users` table manages system users:

| Field      | Description                           |
| ---------- | ------------------------------------- |
| `id`       | Primary key                           |
| `username` | Username                              |
| `password` | Password                              |
| `role`     | User role (admin/user)                |
| `category` | User category (user/dispatch_user)    |
| 'category' | User category (user/sales_user)       |
| 'category' | User category (user/sales_manager)    |
| 'category' | User category (user/dispatch_manager) |
| 'category' | User category (user/accounts_user)    |
| 'category' | User category (user/accounts_manager) |
| 'category' | User category (user/hr_manager)       |
| 'category' | User category (user/hr_user)          |
| 'category' | User category (user/admin_user)       |
| 'category' | User category (user/admin_manager)    |
| 'category' | User category (user/super_admin)      |

### Notifications

The `notifications` table tracks system notifications:

| Field        | Description                      |
| ------------ | -------------------------------- |
| `id`         | Primary key                      |
| `username`   | Username the notification is for |
| `message`    | Notification message             |
| `created_at` | Date and time of creation        |

## Key Features

### Carrier Management

- Create, edit, view and delete carrier profiles
- Track insurance and factoring information
- Store carrier documents (insurance certificates, W-9, etc.)
- Track truck specifications and capabilities

### Dispatch Management

- Create, Edit, View and track load dispatches
- Monitor pickup and delivery information
- Track broker and payment details
- Manage invoice status

### Load Management

- Detailed load tracking with status updates
- Monitor payment and invoice status
- Track broker relationship information
- Record remarks and special instructions

### User Management

- Role-based access control (admin/user)
- Secure authentication
- Activity tracking through notifications
  Activity Logs

## Integration Points

- Insurance verification
- Document storage and retrieval
- User authentication and authorization
- Load and dispatch status tracking
- Payment processing and invoicing
- Carrier and broker relationship management

## Carrier Profile Requirements

To add a new carrier to the system, the following information is typically required:

- MC and DOT numbers
- Company name and owner details
- Contact information (phone, email, address)
- EIN number for tax purposes
- Truck specifications (type, dimensions, capacity)
- Available equipment and accessories
- Insurance details with proof of coverage
- Factoring company information if applicable
- Preferred lanes and working schedule
- Commission percentage agreement

## Dispatch and Load Requirements

To create a dispatch or load in the system, the following information is needed:

- Pickup and delivery locations with dates (pickup and deliver locations could be multiple)
- Equipment requirements
- Rate information and commission percentage
- Broker details including contact information
- Client information
- Special instructions or requirements
- Payment terms and method (ACH, ZELLE, OTHER)

## Reporting

The system includes reporting capabilities for:

- Carrier performance tracking
- Dispatch status summaries
- Invoice and payment status
  including paid and unpaid invoices details
- Agent activity tracking
- Load profitability analysis
  SALARIES (basic salary)
  COMISSIONS (comission on each confirmed sale or confirmed dispatch)

what is confirmed? confirmd sale is when a sale person closes a driver (driver agrees to work with us on a certain % and get a load from us and delivers it to the destination and sends us our invoice) this is confirmd sales
similarly confirm dispatch is once a driver takes a load from us and delivers it and sends us the invoice that is confirmed dispatch

comission structure:
on 500 basic salary is justified of the agent and he / she ll get the comission as well

## Below things will go into the carrier profile but an admin can add them and only the admin can share any specific information from the below to any or selected user

DAT:
DAT username / Email
DAT password

Truckstop:
Truckstop user / email
Truckstop password
Truckstop / RMIS Carrier ID
Truckstop / RMIS Carrier Zip

ELD:

ELD Provider
ELD Site
ELD Username / email
ELD Password

My Carrier Packets Details:

MyCarrierPackets Username / email
MyCarrierPackets Password

// need
