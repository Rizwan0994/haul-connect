import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle, Ban, Eye, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { dispatchApprovalAPI, DispatchApproval, DispatchApprovalHistoryItem } from '@/services/dispatchApprovalApi';
import { useAuth } from '@/components/auth/auth-context';
import { useSocket } from '@/contexts/SocketContext';
import { format } from 'date-fns';

export default function ApprovalDashboard() {
  const [pendingDispatches, setPendingDispatches] = useState<DispatchApproval[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<DispatchApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchApproval | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalType, setApprovalType] = useState<'manager' | 'accounts'>('manager');
  const [activeTab, setActiveTab] = useState('pending');
  const { currentUser, hasPermission, hasSpecificPermission } = useAuth();
  const { socket, isConnected } = useSocket();
  // Check user permissions
  const canApproveAsManager = hasPermission(['manager', 'admin', 'Manager', 'Admin', 'Super Admin']) || hasSpecificPermission('dispatch.approve.manager');
  const canApproveAsAccounts = hasPermission(['account', 'admin', 'Account', 'Admin', 'Super Admin']) || hasSpecificPermission('dispatch.approve.accounts');
  const canReject = hasPermission(['manager', 'admin', 'account', 'Manager', 'Admin', 'Account', 'Super Admin']) || hasSpecificPermission('dispatch.reject');
  const canDisable = hasPermission(['admin', 'Admin', 'Super Admin']) || hasSpecificPermission('dispatch.disable');
  const hasViewHistoryPermission = hasPermission(['admin', 'manager', 'Admin', 'Manager', 'Super Admin']) || hasSpecificPermission('dispatch.view.history');

  // Fetch approval history
  const fetchApprovalHistory = useCallback(async () => {
    if (!hasViewHistoryPermission) {
      return;
    }

    try {
      setHistoryLoading(true);
      const data = await dispatchApprovalAPI.getApprovalHistory();
      setApprovalHistory(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching approval history:', err);
      setError('Failed to fetch approval history');
    } finally {
      setHistoryLoading(false);
    }
  }, [hasViewHistoryPermission]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchApprovalHistory();
    } else {
      fetchPendingDispatches();
    }
  }, [activeTab, fetchApprovalHistory]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleDispatchUpdate = () => {
      if (activeTab === 'history') {
        fetchApprovalHistory();
      } else {
        fetchPendingDispatches();
      }
    };

    socket.on('dispatchApprovalUpdate', handleDispatchUpdate);
    socket.on('dispatchStatusChange', handleDispatchUpdate);

    return () => {
      socket.off('dispatchApprovalUpdate', handleDispatchUpdate);
      socket.off('dispatchStatusChange', handleDispatchUpdate);
    };
  }, [socket, isConnected, activeTab, fetchApprovalHistory]);
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
      
      // Also refresh history if it's the active tab
      if (activeTab === 'history') {
        fetchApprovalHistory();
      }
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
      await dispatchApprovalAPI.rejectDispatch(selectedDispatch.id, rejectReason.trim());      await fetchPendingDispatches();
      setShowRejectDialog(false);
      setSelectedDispatch(null);
      setRejectReason('');
      
      // Also refresh history if it's the active tab
      if (activeTab === 'history') {
        fetchApprovalHistory();
      }
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
      await dispatchApprovalAPI.disableDispatch(selectedDispatch.id);      await fetchPendingDispatches();
      setShowDisableDialog(false);
      setSelectedDispatch(null);
      
      // Also refresh history if it's the active tab
      if (activeTab === 'history') {
        fetchApprovalHistory();
      }
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

  // Approval history table columns
  const historyColumns: ColumnDef<DispatchApprovalHistoryItem>[] = [
    {
      accessorKey: 'dispatch.id',
      header: 'Dispatch ID',
      cell: ({ row }) => (
        <div className="font-medium">#{row.original.dispatch.id}</div>
      ),
    },
    {
      accessorKey: 'dispatch.load_no',
      header: 'Load Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.dispatch.load_no || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'dispatch.carrier.company_name',
      header: 'Carrier',
      cell: ({ row }) => (
        <div>{row.original.dispatch.carrier?.company_name || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const action = row.getValue('action') as string;
        const getActionBadge = (action: string) => {
          switch (action) {
            case 'created':
              return <Badge variant="outline" className="bg-blue-50 text-blue-800">Created</Badge>;
            case 'manager_approved':
              return <Badge variant="outline" className="bg-green-50 text-green-800">Manager Approved</Badge>;
            case 'accounts_approved':
              return <Badge variant="outline" className="bg-emerald-50 text-emerald-800">Accounts Approved</Badge>;
            case 'rejected':
              return <Badge variant="destructive">Rejected</Badge>;
            case 'disabled':
              return <Badge variant="secondary">Disabled</Badge>;
            case 'enabled':
              return <Badge variant="outline" className="bg-green-50 text-green-800">Enabled</Badge>;
            default:
              return <Badge variant="outline">{action}</Badge>;
          }
        };
        return getActionBadge(action);
      },
    },
    {
      accessorKey: 'action_by',
      header: 'Action By',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.action_by.first_name} {row.original.action_by.last_name}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.action_by.role}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'action_at',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue('action_at')).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes/Reason',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="text-sm text-muted-foreground truncate">
            {row.original.rejection_reason || row.original.notes || '-'}
          </div>
        </div>
      ),
    },
  ];

  // Dispatch approval table columns
  const columns: ColumnDef<DispatchApproval>[] = [
    {
      accessorKey: 'id',
      header: 'Dispatch ID',
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'load_no',
      header: 'Load Number',
    },
    {
      accessorKey: 'user',
      header: 'Creator',
      cell: ({ row }) => {
        const user = row.getValue('user') as any;
        return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
      },
    },
    {
      accessorKey: 'carrier',
      header: 'Carrier',
      cell: ({ row }) => {
        const carrier = row.getValue('carrier') as any;
        return carrier ? carrier.company_name : 'N/A';
      },
    },
    {
      accessorKey: 'approval_status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('approval_status')),
    },
    {
      header: 'Created',
      cell: () => 'Recently', // You can add created_at field to the API later
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const dispatch = row.original;
        return (
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
        );
      },
    },
  ];

  if (loading && activeTab !== 'history') {
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
        </div>        <Button onClick={fetchPendingDispatches} variant="outline">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${hasViewHistoryPermission ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          {hasViewHistoryPermission && (
            <TabsTrigger value="history">Approval History</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="pending" className="mt-6">
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
                <DataTable
                  columns={columns}
                  data={pendingDispatches}
                  searchPlaceholder="Search by dispatch ID, load number, or carrier..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {hasViewHistoryPermission && (
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Approval History</CardTitle>
                <CardDescription>
                  Complete history of all dispatch approval actions and decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <span className="ml-2">Loading approval history...</span>
                  </div>
                ) : (
                  <DataTable
                    columns={historyColumns}
                    data={approvalHistory}
                    searchPlaceholder="Search by dispatch ID, load number, or action..."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

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
