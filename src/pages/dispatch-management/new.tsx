
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DispatchCreateForm } from '@/components/dispatch-management/dispatch-create-form'

export default function NewDispatch() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Dispatch</CardTitle>
        </CardHeader>
        <CardContent>
          <DispatchCreateForm />
        </CardContent>
      </Card>
    </div>
  )
}
