
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/dispatch-management/columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type Dispatch } from '@/lib/dispatch-data'

// Mock data for now - replace with actual data fetching
const mockDispatches: Dispatch[] = [
  {
    id: '1',
    user_id: 'user_1',
    user: 'John Doe',
    department: 'Dispatch',
    booking_date: '2024-01-10',
    created_at: '2024-01-10',
    load_no: 'LD-001',
    pickup_date: '2024-01-15',
    dropoff_date: '2024-01-16',
    carrier_id: 'carrier_1',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    brokerage_company: 'Broker LLC',
    brokerage_agent: 'Agent Smith',
    agent_ph: '555-0123',
    agent_email: 'agent@broker.com',
    load_amount: 1500,
    charge_percent: 8.5,
    status: 'Delivered' as const,
    payment: 'Payment completed',
    dispatcher: 'John Doe',
    invoice_status: 'Invoice Cleared' as const,
    payment_method: 'ACH' as const,
    carrier: {
      id: 'carrier_1',
      company_name: 'Swift Transportation',
      mc_number: 'MC123456',
      owner_name: 'Swift Owner',
      phone_number: '555-0199',
      email_address: 'swift@email.com',
      truck_type: 'Dry Van',
      status: 'active' as const,
    },
  },
  {
    id: '2',
    user_id: 'user_2',
    user: 'Jane Smith',
    department: 'Dispatch',
    booking_date: '2024-01-12',
    created_at: '2024-01-12',
    load_no: 'LD-002',
    pickup_date: '2024-01-18',
    dropoff_date: '2024-01-20',
    carrier_id: 'carrier_2',
    origin: 'Chicago, IL',
    destination: 'Denver, CO',
    brokerage_company: 'Transport Broker Inc',
    brokerage_agent: 'Agent Johnson',
    agent_ph: '555-0456',
    agent_email: 'johnson@transport.com',
    load_amount: 2200,
    charge_percent: 7.0,
    status: 'In Transit' as const,
    payment: 'Pending payment',
    dispatcher: 'Jane Smith',
    invoice_status: 'Invoice Pending' as const,
    payment_method: 'ZELLE' as const,
    carrier: {
      id: 'carrier_2',
      company_name: 'Schneider National',
      mc_number: 'MC789012',
      owner_name: 'Schneider Owner',
      phone_number: '555-0288',
      email_address: 'schneider@email.com',
      truck_type: 'Refrigerated',
      status: 'active' as const,
    },
  },
]

export default function DispatchManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispatch Management</h1>
          <p className="text-muted-foreground">
            Manage your dispatches and load assignments
          </p>
        </div>
        <Link to="/dispatch-management/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Dispatch
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={mockDispatches} />
    </div>
  )
}
