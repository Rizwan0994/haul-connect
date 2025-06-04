import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle, Ban, Eye } from 'lucide-react';
import { dispatchApprovalAPI, DispatchApproval } from '@/services/dispatchApprovalApi';
import { useAuth } from '@/components/auth/auth-context';
import { useSocket } from '@/contexts/SocketContext';
import { format } from 'date-fns';

export default function ApprovalDashboard() {
  const [pendingDispatches, setPendingDispatches] = useState<DispatchApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchApproval | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalType, setApprovalType] = useState<'manager' | 'accounts'>('manager');
  const { currentUser, hasPermission, hasSpecificPermission } = useAuth();
  const { socket, isConnected } = useSocket();

  // Check user permissions
  const canApproveAsManager = hasPermission(['manager', 'admin', 'Manager', 'Admin', 'Super Admin']) || hasSpecificPermission('dispatch.approve.manager');
  const canApproveAsAccounts = hasPermission(['account', 'admin', 'Account', 'Admin', 'Super Admin']) || hasSpecificPermission('dispatch.approve.accounts');
  const canReject = hasPermission(['manager', 'admin', 'account', 'Manager', 'Admin', 'Account', 'Super Admin']) || hasSpecificPermission('dispatch.reject');
  const canDisable = hasPermission(['admin', 'Admin', 'Super Admin']) || hasSpecificPermission('dispatch.disable');
  useEffect(() => {
    fetchPendingDispatches();
  }, []);

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleDispatchUpdate = () => {
      fetchPendingDispatches();
    };

    socket.on('dispatchApprovalUpdate', handleDispatchUpdate);
    socket.on('dispatchStatusChange', handleDispatchUpdate);

    return () => {
      socket.off('dispatchApprovalUpdate', handleDispatchUpdate);
      socket.off('dispatchStatusChange', handleDispatchUpdate);
    };
  }, [socket, isConnected]);

  const fetchPendingDispatches = async () => {
    try {
      setLoading(true);
      const dispatches = await dispatchApprovalAPI.getPendingDispatches();
      setPendingDispatches(dispatches);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending dispatches:', err);
      setError('Failed to load pending dispatches');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedDispatch) return;
    
    try {
      setActionLoading(true);
      
      if (approvalType === 'manager') {
        await dispatchApprovalAPI.approveAsManager(selectedDispatch.id);
      } else {
        await dispatchApprovalAPI.approveAsAccounts(selectedDispatch.id);
      }
      
      await fetchPendingDispatches();
      setShowApprovalDialog(false);
      setSelectedDispatch(null);
    } catch (err) {
      console.error('Error approving dispatch:', err);
      setError('Failed to approve dispatch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDispatch || !rejectReason.trim()) return;
    
    try {
      setActionLoading(true);
      await dispatchApprovalAPI.rejectDispatch(selectedDispatch.id, rejectReason.trim());
      await fetchPendingDispatches();
      setShowRejectDialog(false);
      setSelectedDispatch(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting dispatch:', err);
      setError('Failed to reject dispatch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!selectedDispatch) return;
    
    try {
      setActionLoading(true);
      await dispatchApprovalAPI.disableDispatch(selectedDispatch.id);
      await fetchPendingDispatches();
      setShowDisableDialog(false);
      setSelectedDispatch(null);
    } catch (err) {
      console.error('Error disabling dispatch:', err);
      setError('Failed to disable dispatch');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'manager_approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200"><CheckCircle className="w-3 h-3 mr-1" />Manager Approved</Badge>;
      case 'accounts_approved':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'disabled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200"><Ban className="w-3 h-3 mr-1" />Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openApprovalDialog = (dispatch: DispatchApproval, type: 'manager' | 'accounts') => {
    setSelectedDispatch(dispatch);
    setApprovalType(type);
    setShowApprovalDialog(true);
  };

  const openRejectDialog = (dispatch: DispatchApproval) => {
    setSelectedDispatch(dispatch);
    setShowRejectDialog(true);
  };

  const openDisableDialog = (dispatch: DispatchApproval) => {
    setSelectedDispatch(dispatch);
    setShowDisableDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dispatch Approvals</h1>
          <p className="text-gray-600">Review and approve pending dispatches</p>
        </div>
        <Button onClick={fetchPendingDispatches} variant="outline">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Approvals ({pendingDispatches.length})
          </CardTitle>
          <CardDescription>
            Dispatches requiring your approval based on your role permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDispatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No pending approvals at this time</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispatch ID</TableHead>
                    <TableHead>Load Number</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDispatches.map((dispatch) => (
                    <TableRow key={dispatch.id}>
                      <TableCell className="font-medium">#{dispatch.id}</TableCell>
                      <TableCell>{dispatch.load_no || 'N/A'}</TableCell>
                      <TableCell>
                        {dispatch.user ? `${dispatch.user.first_name} ${dispatch.user.last_name}` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {dispatch.carrier ? dispatch.carrier.company_name : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(dispatch.approval_status)}</TableCell>
                      <TableCell>
                        {/* Assuming created_at would be available - you might need to add this to the API */}
                        {/* {format(new Date(dispatch.created_at), 'MMM dd, yyyy')} */}
                        Recently
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Manager Approval */}
                          {dispatch.approval_status === 'pending' && canApproveAsManager && (
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(dispatch, 'manager')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          
                          {/* Accounts Approval */}
                          {dispatch.approval_status === 'manager_approved' && canApproveAsAccounts && (
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(dispatch, 'accounts')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Final Approve
                            </Button>
                          )}
                          
                          {/* Reject */}
                          {(['pending', 'manager_approved'].includes(dispatch.approval_status)) && canReject && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(dispatch)}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          )}
                          
                          {/* Disable */}
                          {canDisable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDisableDialog(dispatch)}
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Disable
                            </Button>
                          )}
                          
                          {/* View Details */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/dispatch-management/${dispatch.id}`, '_blank')}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalType === 'manager' ? 'Manager Approval' : 'Final Accounts Approval'}
            </DialogTitle>
            <DialogDescription>
              {approvalType === 'manager' 
                ? 'Approve this dispatch to proceed to accounts review'
                : 'Give final approval to activate this dispatch for commission/invoice counting'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p><strong>Dispatch ID:</strong> #{selectedDispatch?.id}</p>
            <p><strong>Load Number:</strong> {selectedDispatch?.load_no || 'N/A'}</p>
            <p><strong>Carrier:</strong> {selectedDispatch?.carrier?.company_name || 'N/A'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproval} disabled={actionLoading}>
              {actionLoading ? 'Approving...' : `${approvalType === 'manager' ? 'Approve' : 'Final Approve'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Dispatch</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this dispatch
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4"><strong>Dispatch ID:</strong> #{selectedDispatch?.id}</p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Dispatch</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable this dispatch? This action will prevent it from being processed further.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p><strong>Dispatch ID:</strong> #{selectedDispatch?.id}</p>
            <p><strong>Load Number:</strong> {selectedDispatch?.load_no || 'N/A'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisable} disabled={actionLoading}>
              {actionLoading ? 'Disabling...' : 'Disable Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
