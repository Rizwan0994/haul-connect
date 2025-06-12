import React, { useState, useEffect } from "react";
import DraggableModal from "../carrier-management/draggable-modal";
import { useModals } from "./modal-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  User,
  Calendar,
  DollarSign,
  FileText,
  Package,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { dispatchAPI, Dispatch } from "@/lib/dispatch-api";
import { format } from "date-fns";

interface DispatchProfileModalProps {
  id: string;
  modalId: string;
  zIndex: number;
}

const DispatchProfileModal: React.FC<DispatchProfileModalProps> = ({
  id,
  modalId,
  zIndex,
}) => {
  const { closeModal, focusModal } = useModals();
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if this is a create modal or edit modal
  const isCreateMode = id === 'create-dispatch';
  const isEditMode = modalId.startsWith('edit-dispatch-');
  
  // Extract actual dispatch ID from modalId for edit mode
  const actualDispatchId = isEditMode ? modalId.replace('edit-dispatch-', '') : id;

  useEffect(() => {
    const loadDispatchData = async () => {
      try {
        setLoading(true);
        
        // Check if this is a create modal
        if (isCreateMode) {
          // For create mode, we'd typically show a form
          // For now, just set loading to false
          setLoading(false);
          return;
        } else {
          // For view/edit mode, get dispatch data from API using actual dispatch ID
          const data = await dispatchAPI.getDispatchById(parseInt(actualDispatchId));
          if (data) {
            setDispatch(data);
          }
        }
      } catch (error) {
        console.error("Failed to load dispatch data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDispatchData();
  }, [isCreateMode, actualDispatchId]);

  const handleClose = () => {
    closeModal(modalId);
  };

  const handleFocus = () => {
    focusModal(modalId);
  };

  if (loading) {
    return (
      <DraggableModal
        id={modalId}
        title={`Loading dispatch details...`}
        isOpen={true}
        onClose={handleClose}
        zIndex={zIndex}
        onFocus={handleFocus}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DraggableModal>
    );
  }

  if (!dispatch) {
    return (
      <DraggableModal
        id={modalId}
        title="Error"
        isOpen={true}
        onClose={handleClose}
        zIndex={zIndex}
        onFocus={handleFocus}
      >
        <div className="text-center text-destructive">
          Failed to load dispatch data
        </div>
      </DraggableModal>
    );
  }

  // Map status to color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusColorClass = getStatusColor(dispatch.status);

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return "-";
    }
  };

  return (
    <DraggableModal
      id={modalId}
      title={dispatch ? `Dispatch #${dispatch.load_no}` : 'Loading...'}
      isOpen={true}
      onClose={handleClose}
      zIndex={zIndex}
      onFocus={handleFocus}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carrier">Carrier</TabsTrigger>
          <TabsTrigger value="broker">Broker</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Load #{dispatch.load_no}</h2>
              <div className="flex items-center text-muted-foreground">
                <span className="mr-2">ID: {dispatch.id}</span>
                <span className="mr-2">•</span>
                <span>{dispatch.dispatcher}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className={`${statusColorClass} capitalize`}
              >
                {dispatch.status}
              </Badge>
              {dispatch.created_at && (
                <div className="text-sm text-muted-foreground">
                  Created on {formatDate(dispatch.created_at)}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{dispatch.origin}</div>
                    <div className="text-sm text-muted-foreground">Origin</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{dispatch.destination}</div>
                    <div className="text-sm text-muted-foreground">Destination</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatDate(dispatch.pickup_date)}</div>
                    <div className="text-sm text-muted-foreground">Pickup Date</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatDate(dispatch.dropoff_date)}</div>
                    <div className="text-sm text-muted-foreground">Delivery Date</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">${dispatch.load_amount?.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Load Amount</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {dispatch.charge_percent}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Commission Rate
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{dispatch.invoice_status}</div>
                    <div className="text-sm text-muted-foreground">Invoice Status</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{dispatch.payment_method || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Carrier Tab */}
        <TabsContent value="carrier">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Information</CardTitle>
              <CardDescription>Details about the assigned carrier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dispatch.carrier ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Company Name</h4>
                    <p>{dispatch.carrier.company_name}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">MC Number</h4>
                      <p>{dispatch.carrier.mc_number}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Owner</h4>
                      <p>{dispatch.carrier.owner_name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p>{dispatch.carrier.phone_number}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <p>{dispatch.carrier.email_address}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Truck Type</h4>
                      <p>{dispatch.carrier.truck_type}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Status</h4>
                      <Badge
                        variant="outline"
                        className={dispatch.carrier.status === "active" 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {dispatch.carrier.status}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No carrier assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broker Tab */}
        <TabsContent value="broker">
          <Card>
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
              <CardDescription>Brokerage company and agent details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Brokerage Company</h4>
                <p>{dispatch.brokerage_company}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-1">Agent Name</h4>
                  <p>{dispatch.brokerage_agent}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Phone</h4>
                  <p>{dispatch.agent_ph}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Email</h4>
                  <p>{dispatch.agent_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>
                Commission and payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Load Amount</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${dispatch.load_amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Commission Rate</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {dispatch.charge_percent}%
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Commission Amount</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    ${((dispatch.load_amount || 0) * (dispatch.charge_percent || 0) / 100).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Department</h4>
                  <p>{dispatch.department}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Payment Method</h4>
                  <p>{dispatch.payment_method || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Payment Status</h4>
                  <p>{dispatch.payment || 'Pending'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Approval Status</h4>
                {dispatch.approval_status && (
                  <Badge
                    variant="outline"
                    className={
                      dispatch.approval_status === "accounts_approved"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : dispatch.approval_status === "manager_approved"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : dispatch.approval_status === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : dispatch.approval_status === "rejected"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {dispatch.approval_status === "accounts_approved" ? "Approved" : 
                     dispatch.approval_status === "manager_approved" ? "Manager Approved" :
                     dispatch.approval_status === "pending" ? "Pending" :
                     dispatch.approval_status === "rejected" ? "Rejected" :
                     dispatch.approval_status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DraggableModal>
  );
};

export default DispatchProfileModal;
