
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DispatchInvoice() {
  const { id } = useParams()

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice for Dispatch {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Invoice view will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
