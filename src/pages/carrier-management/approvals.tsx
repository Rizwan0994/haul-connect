import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, Ban, Eye, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { carrierApprovalApi, CarrierApprovalItem } from '@/services/carrierApprovalApi';
import { useAuth } from '@/components/auth/auth-context';
import { useSocket } from '@/contexts/SocketContext';

interface ActionDialogState {
  open: boolean;
  type: 'approve-manager' | 'approve-accounts' | 'reject' | 'disable' | null;
  carrier: CarrierApprovalItem | null;
  rejectionReason: string;
}

export default function CarrierApprovals() {
  const { toast } = useToast();
  const { currentUser, hasPermission, hasSpecificPermission } = useAuth();
  const { socket, isConnected } = useSocket();
  const [carriers, setCarriers] = useState<CarrierApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    type: null,
    carrier: null,
    rejectionReason: ''
  });

  // Check user permissions
  const hasManagerApprovePermission = hasPermission(['manager', 'admin', 'Manager', 'Admin', 'Super Admin']) || hasSpecificPermission('carrier.approve.manager');
  const hasAccountsApprovePermission = hasPermission(['account', 'admin', 'Account', 'Admin', 'Super Admin']) || hasSpecificPermission('carrier.approve.accounts');
  const hasRejectPermission = hasPermission(['manager', 'admin', 'account', 'Manager', 'Admin', 'Account', 'Super Admin']) || hasSpecificPermission('carrier.reject');
  const hasDisablePermission = hasPermission(['admin', 'Admin', 'Super Admin']) || hasSpecificPermission('carrier.disable');
  const hasViewPendingPermission = hasPermission(['manager', 'admin', 'account', 'Manager', 'Admin', 'Account', 'Super Admin']) || hasSpecificPermission('carrier.view.pending');

  // Fetch carriers based on status
  const fetchCarriers = useCallback(async (status?: 'pending' | 'manager_approved' | 'approved' | 'rejected' | 'disabled') => {
    if (!hasViewPendingPermission) {
      return;
    }

    try {
      setLoading(true);
      const data = await carrierApprovalApi.getPendingCarriers(status);
      setCarriers(data);
    } catch (error: any) {
      console.error('Error fetching carriers:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch carriers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [hasViewPendingPermission]);

  // Initial load and tab change handler
  useEffect(() => {
    const statusMap: Record<string, 'pending' | 'manager_approved' | 'approved' | 'rejected' | 'disabled' | undefined> = {
      'pending': 'pending',
      'manager-approved': 'manager_approved',
      'approved': 'approved',
      'rejected': 'rejected',
      'disabled': 'disabled',
      'all': undefined
    };
    
    fetchCarriers(statusMap[activeTab]);
  }, [activeTab, fetchCarriers]);
  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleCarrierUpdate = () => {
      const statusMap: Record<string, 'pending' | 'manager_approved' | 'approved' | 'rejected' | 'disabled' | undefined> = {
        'pending': 'pending',
        'manager-approved': 'manager_approved',
        'approved': 'approved',
        'rejected': 'rejected',
        'disabled': 'disabled',
        'all': undefined
      };
      
      fetchCarriers(statusMap[activeTab]);
    };

    socket.on('carrierApprovalUpdate', handleCarrierUpdate);
    socket.on('carrierStatusChange', handleCarrierUpdate);

    return () => {
      socket.off('carrierApprovalUpdate', handleCarrierUpdate);
      socket.off('carrierStatusChange', handleCarrierUpdate);
    };
  }, [socket, isConnected, activeTab, fetchCarriers]);

  // Handle approval actions
  const handleAction = async () => {
    if (!actionDialog.carrier || !actionDialog.type) return;

    try {
      setActionLoading(true);
      const carrierId = actionDialog.carrier.id;

      switch (actionDialog.type) {
        case 'approve-manager':
          await carrierApprovalApi.approveAsManager(carrierId);
          toast({
            title: 'Success',
            description: 'Carrier approved by manager successfully',
          });
          break;
        case 'approve-accounts':
          await carrierApprovalApi.approveAsAccounts(carrierId);
          toast({
            title: 'Success',
            description: 'Carrier approved by accounts successfully',
          });
          break;
        case 'reject':
          if (!actionDialog.rejectionReason.trim()) {
            toast({
              title: 'Error',
              description: 'Rejection reason is required',
              variant: 'destructive',
            });
            return;
          }
          await carrierApprovalApi.rejectCarrier(carrierId, actionDialog.rejectionReason);
          toast({
            title: 'Success',
            description: 'Carrier rejected successfully',
          });
          break;
        case 'disable':
          await carrierApprovalApi.disableCarrier(carrierId);
          toast({
            title: 'Success',
            description: 'Carrier disabled successfully',
          });
          break;
      }

      // Refresh data
      const statusMap: Record<string, 'pending' | 'manager_approved' | 'approved' | 'rejected' | 'disabled' | undefined> = {
        'pending': 'pending',
        'manager-approved': 'manager_approved',
        'approved': 'approved',
        'rejected': 'rejected',
        'disabled': 'disabled',
        'all': undefined
      };
      
      fetchCarriers(statusMap[activeTab]);
      closeActionDialog();
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: 'Error',
        description: error.message || 'Action failed',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (type: ActionDialogState['type'], carrier: CarrierApprovalItem) => {
    setActionDialog({
      open: true,
      type,
      carrier,
      rejectionReason: ''
    });
  };

  const closeActionDialog = () => {
    setActionDialog({
      open: false,
      type: null,
      carrier: null,
      rejectionReason: ''
    });
  };

  // Status badge component
  const StatusBadge = ({ status, isDisabled }: { status: string; isDisabled: boolean }) => {
    if (isDisabled) {
      return <Badge variant="secondary" className="bg-gray-500 text-white">Disabled</Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Pending</Badge>;
      case 'manager_approved':
        return <Badge variant="secondary" className="bg-blue-500 text-white">Manager Approved</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Table columns
  const columns: ColumnDef<CarrierApprovalItem>[] = [
    {
      accessorKey: 'mc_number',
      header: 'MC Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('mc_number')}</div>
      ),
    },
    {
      accessorKey: 'company_name',
      header: 'Company Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('company_name')}</div>
      ),
    },
    {
      accessorKey: 'owner_name',
      header: 'Owner',
    },
    {
      accessorKey: 'agent_name',
      header: 'Agent',
    },
    {
      accessorKey: 'approval_status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.getValue('approval_status')} 
          isDisabled={row.original.is_disabled}
        />
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const carrier = row.original;
        const canApproveAsManager = hasManagerApprovePermission && carrier.approval_status === 'pending';
        const canApproveAsAccounts = hasAccountsApprovePermission && carrier.approval_status === 'manager_approved';
        const canReject = hasRejectPermission && ['pending', 'manager_approved'].includes(carrier.approval_status);
        const canDisable = hasDisablePermission && !carrier.is_disabled;

        return (
          <div className="flex items-center gap-2">
            {canApproveAsManager && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog('approve-manager', carrier)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            {canApproveAsAccounts && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog('approve-accounts', carrier)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Final Approve
              </Button>
            )}
            {canReject && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog('reject', carrier)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
            {canDisable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog('disable', carrier)}
                className="text-gray-600 hover:text-gray-700"
              >
                <Ban className="h-4 w-4 mr-1" />
                Disable
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(`/carrier-management/${carrier.id}`, '_blank')}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (!hasViewPendingPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view carrier approvals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carrier Approvals</h1>
        <p className="text-muted-foreground">
          Manage carrier profile approvals and status changes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="manager-approved">Manager Approved</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="disabled">Disabled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Carriers
              </CardTitle>
              <CardDescription>
                {activeTab === 'pending' && 'Carriers awaiting manager approval'}
                {activeTab === 'manager-approved' && 'Carriers approved by manager, awaiting accounts approval'}
                {activeTab === 'approved' && 'Fully approved and active carriers'}
                {activeTab === 'rejected' && 'Rejected carrier profiles'}
                {activeTab === 'disabled' && 'Disabled carrier profiles'}
                {activeTab === 'all' && 'All carriers in the approval system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading carriers...</span>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={carriers}
                  searchPlaceholder="Search by MC number, company name, or owner..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve-manager' && 'Approve Carrier (Manager)'}
              {actionDialog.type === 'approve-accounts' && 'Final Approval (Accounts)'}
              {actionDialog.type === 'reject' && 'Reject Carrier'}
              {actionDialog.type === 'disable' && 'Disable Carrier'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approve-manager' && 
                'Approve this carrier as a manager. The carrier will then require accounts approval.'}
              {actionDialog.type === 'approve-accounts' && 
                'Give final approval to this carrier. The carrier will become active.'}
              {actionDialog.type === 'reject' && 
                'Reject this carrier profile. Please provide a reason for rejection.'}
              {actionDialog.type === 'disable' && 
                'Disable this carrier profile. This action can be reversed later.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.carrier && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>MC Number:</strong> {actionDialog.carrier.mc_number}
                  </div>
                  <div>
                    <strong>Company:</strong> {actionDialog.carrier.company_name}
                  </div>
                  <div>
                    <strong>Owner:</strong> {actionDialog.carrier.owner_name}
                  </div>
                  <div>
                    <strong>Agent:</strong> {actionDialog.carrier.agent_name || 'N/A'}
                  </div>
                </div>
              </div>

              {actionDialog.type === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a detailed reason for rejection..."
                    value={actionDialog.rejectionReason}
                    onChange={(e) => 
                      setActionDialog(prev => ({ ...prev, rejectionReason: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={actionLoading}
              variant={actionDialog.type === 'reject' || actionDialog.type === 'disable' ? 'destructive' : 'default'}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionDialog.type === 'approve-manager' && 'Approve as Manager'}
              {actionDialog.type === 'approve-accounts' && 'Give Final Approval'}
              {actionDialog.type === 'reject' && 'Reject Carrier'}
              {actionDialog.type === 'disable' && 'Disable Carrier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
