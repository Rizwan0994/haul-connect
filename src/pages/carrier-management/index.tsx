
'use client'

import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/carrier-management/columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCarrierModal } from '@/hooks/use-carrier-modal'
import { carriersData } from '@/lib/carriers-data'

export default function CarrierManagement() {
  const { onOpen } = useCarrierModal()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carrier Management</h1>
          <p className="text-muted-foreground">
            Manage your carrier profiles and assignments
          </p>
        </div>
        <Button onClick={() => onOpen('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Carrier
        </Button>
      </div>

      <DataTable columns={columns} data={carriersData} />
    </div>
  )
}
