
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DispatchDetail() {
  const { id } = useParams()

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Dispatch Detail {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dispatch detail view will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
