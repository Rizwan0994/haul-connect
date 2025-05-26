
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DispatchEdit() {
  const { id } = useParams()

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Dispatch {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dispatch edit form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
