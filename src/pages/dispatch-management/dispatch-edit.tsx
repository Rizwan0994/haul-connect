
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DispatchEditForm } from '@/components/dispatch-management/dispatch-edit-form'
import { dispatchAPI, Dispatch } from '@/lib/dispatch-api'
import { useToast } from '@/components/ui/use-toast'

export default function DispatchEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [dispatch, setDispatch] = useState<Dispatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDispatch = async () => {
      if (!id) {
        setError('No dispatch ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const dispatchData = await dispatchAPI.getDispatchById(parseInt(id))
        setDispatch(dispatchData)
      } catch (err: any) {
        console.error('Error fetching dispatch:', err)
        setError(err.message || 'Failed to load dispatch')
        toast({
          title: 'Error',
          description: 'Failed to load dispatch. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDispatch()
  }, [id]) // Removed toast dependency

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Dispatch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading dispatch...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !dispatch) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Dispatch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-destructive/15 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Error loading dispatch
                  </h3>
                  <div className="mt-2 text-sm text-destructive">
                    <p>{error || 'Dispatch not found'}</p>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/dispatch-management')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dispatches
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Dispatch {dispatch.load_no}</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dispatch-management')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dispatches
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DispatchEditForm dispatch={dispatch} id={id!} />
        </CardContent>
      </Card>
    </div>
  )
}
