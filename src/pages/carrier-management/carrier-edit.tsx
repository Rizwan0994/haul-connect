
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CarrierEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Carrier {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carrier edit form will be implemented here.</p>
          <Button onClick={() => navigate('/carrier-management')} className="mt-4">
            Back to Carriers
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
