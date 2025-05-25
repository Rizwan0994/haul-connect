import React, { useState, useEffect } from "react";
import DraggableModal from "./draggable-modal";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getCarrierById } from "@/lib/carriers-data";

// Define the carrier type
interface Carrier {
  id: string;
  company_name: string;
  mc_number: string;
  us_dot_number: string;
  owner_name: string;
  phone_number: string;
  email_address: string;
  address: string;
  truck_type: string;
  status: string;
  created_at?: string;
  agreed_percentage?: string;
  dimensions?: string;
  doors_type?: string;
  door_clearance?: string;
  max_weight?: string;
  dock_height?: string;
  accessories?: string;
  temp_control_range?: string;
  insurance_company_name?: string;
  insurance_company_address?: string;
  insurance_agent_name?: string;
  insurance_agent_number?: string;
  insurance_agent_email?: string;
  factoring_company_name?: string;
  factoring_company_address?: string;
  factoring_agent_name?: string;
  factoring_agent_number?: string;
  factoring_agent_email?: string;
  // Notes fields
  notes_home_town?: string;
  notes_days_working?: string;
  notes_preferred_lanes?: string;
  notes_average_gross?: string;
  notes_parking_space?: string;
  notes_additional_preferences?: string;
  // Office use fields
  office_use_carrier_no?: string;
  office_use_team_assigned?: string;
  office_use_special_notes?: string;
}

interface CarrierProfileModalProps {
  id: string;
  modalId: string;
  zIndex: number;
}

const CarrierProfileModal: React.FC<CarrierProfileModalProps> = ({
  id,
  modalId,
  zIndex,
}) => {
  const { closeModal, focusModal } = useModals();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCarrierData = async () => {
      try {
        setLoading(true);
        // Get carrier data from our mock data
        const data = getCarrierById(id);
        if (data) {
          setCarrier(data);
        }
      } catch (error) {
        console.error("Failed to load carrier data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCarrierData();
  }, [id]);

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
        title={`Loading carrier details...`}
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

  if (!carrier) {
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
          Failed to load carrier data
        </div>
      </DraggableModal>
    );
  }

  // Map status to color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const statusColorClass = getStatusColor(carrier.status);

  return (
    <DraggableModal
      id={modalId}
      title={carrier ? `${carrier.company_name} (${carrier.mc_number})` : 'Loading...'}
      isOpen={true}
      onClose={handleClose}
      zIndex={zIndex}
      onFocus={handleFocus}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="factoring">Factoring</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{carrier.company_name}</h2>
              <div className="flex items-center text-muted-foreground">
                <span className="mr-2">{carrier.mc_number}</span>
                <span className="mr-2">•</span>
                <span>{carrier.us_dot_number}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className={`${statusColorClass} capitalize`}
              >
                {carrier.status}
              </Badge>
              {carrier.created_at && (
                <div className="text-sm text-muted-foreground">
                  Created on {new Date(carrier.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <User className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{carrier.owner_name}</div>
                    <div className="text-sm text-muted-foreground">Owner</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{carrier.phone_number}</div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{carrier.email_address}</div>
                    <div className="text-sm text-muted-foreground">Email</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{carrier.address}</div>
                    <div className="text-sm text-muted-foreground">Address</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Truck className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{carrier.truck_type}</div>
                    <div className="text-sm text-muted-foreground">
                      Truck Type
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{carrier.created_at}</div>
                    <div className="text-sm text-muted-foreground">Since</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {carrier.agreed_percentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Commission
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Specifications</CardTitle>
              <CardDescription>Truck and equipment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Truck Type</h4>
                  <p>{carrier.truck_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Dimensions</h4>
                  <p>{carrier.dimensions}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Door Type</h4>
                  <p>{carrier.doors_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Door Clearance</h4>
                  <p>{carrier.door_clearance}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Max Weight</h4>
                  <p>{carrier.max_weight}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Dock Height</h4>
                  <p>{carrier.dock_height}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Temperature Control</h4>
                  <p>{carrier.temp_control_range}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Accessories</h4>
                  <p>{carrier.accessories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Insurance details and contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Insurance Company</h4>
                <p>{carrier.insurance_company_name}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Company Address</h4>
                <p>{carrier.insurance_company_address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-1">Agent Name</h4>
                  <p>{carrier.insurance_agent_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Phone</h4>
                  <p>{carrier.insurance_agent_number}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Email</h4>
                  <p>{carrier.insurance_agent_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factoring Tab */}
        <TabsContent value="factoring">
          <Card>
            <CardHeader>
              <CardTitle>Factoring Information</CardTitle>
              <CardDescription>
                Factoring company details and contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Factoring Company</h4>
                <p>{carrier.factoring_company_name}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Company Address</h4>
                <p>{carrier.factoring_company_address}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-1">Agent Name</h4>
                  <p>{carrier.factoring_agent_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Phone</h4>
                  <p>{carrier.factoring_agent_number}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Agent Email</h4>
                  <p>{carrier.factoring_agent_email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Preferences</CardTitle>
              <CardDescription>
                Additional information about this carrier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Home Town</h4>
                  <p>{carrier.notes_home_town}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Days Working</h4>
                  <p>{carrier.notes_days_working}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Preferred Lanes</h4>
                  <p>{carrier.notes_preferred_lanes}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Average Gross</h4>
                  <p>{carrier.notes_average_gross}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Parking Space</h4>
                  <p>{carrier.notes_parking_space}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-1">Additional Preferences</h4>
                <p className="whitespace-pre-line">
                  {carrier.notes_additional_preferences}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DraggableModal>
  );
};

export default CarrierProfileModal;
