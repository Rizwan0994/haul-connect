import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, UserCheck, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { carrierApiService } from '@/services/carrierApi';
import { userAssignmentApi, AssignedUser } from '@/services/userAssignmentApi';
import { userAPI, User } from '@/lib/user-api';
import UserAssignmentDialog from '@/components/carrier-management/user-assignment-dialog';
import AssignedUsersList from '@/components/carrier-management/assigned-users-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface CarrierInfo {
  id: string;
  company_name: string;
  mc_number: string;
  owner_name: string;
  status: string;
}

export default function CarrierAssignmentsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [carrier, setCarrier] = useState<CarrierInfo | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('assigned');
  // Fetch carrier information
  const fetchCarrier = async () => {
    if (!id) return;
    
    try {
      const carrierData = await carrierApiService.getCarrierById(parseInt(id));
      setCarrier({
        id: carrierData.id?.toString() || '',
        company_name: carrierData.company_name || '',
        mc_number: carrierData.mc_number || '',
        owner_name: carrierData.owner_name || '',
        status: carrierData.status || 'pending'
      });
    } catch (error) {
      console.error('Error fetching carrier:', error);
      toast({
        title: 'Error',
        description: 'Failed to load carrier information',
        variant: 'destructive',
      });
    }
  };

  // Fetch assigned users
  const fetchAssignedUsers = async () => {
    if (!id) return;
    
    try {
      const users = await userAssignmentApi.getCarrierUsers(id);
      setAssignedUsers(users);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assigned users',
        variant: 'destructive',
      });
    }
  };

  // Fetch available users
  const fetchAvailableUsers = async () => {
    try {
      const users = await userAPI.getAllUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available users',
        variant: 'destructive',
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCarrier(),
        fetchAssignedUsers(),
        fetchAvailableUsers()
      ]);
      setLoading(false);
    };

    loadData();
  }, [id]);

  // Handle assignment changes
  const handleAssignmentChange = (count: number) => {
    fetchAssignedUsers(); // Refresh assigned users list
  };

  // Filter assigned users based on search
  const filteredAssignedUsers = assignedUsers.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get unassigned users
  const assignedUserIds = assignedUsers.map(user => user.id);
  const unassignedUsers = availableUsers.filter(user => !assignedUserIds.includes(user.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (!carrier) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carrier not found</p>
        <Link to="/carrier-management">
          <Button variant="outline" className="mt-4">
            Back to Carriers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/carrier-management/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">User Assignments</h1>
          <p className="text-muted-foreground">
            Manage user assignments for {carrier.company_name} (MC: {carrier.mc_number})
          </p>
        </div>
        <Button onClick={() => setIsAssignmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users assigned to this carrier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users available for assignment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrier Status</CardTitle>
            <Badge variant={carrier.status === 'Active' ? 'default' : 'secondary'}>
              {carrier.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{carrier.company_name}</div>
            <p className="text-xs text-muted-foreground">MC: {carrier.mc_number}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user assignments for this carrier
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assigned">
                Assigned Users ({assignedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available Users ({unassignedUsers.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assigned" className="space-y-4">
              <ScrollArea className="h-96">
                {filteredAssignedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No users match your search' : 'No users assigned to this carrier'}
                    </p>
                    {!searchQuery && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsAssignmentDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Assign First User
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                            <AvatarFallback>
                              {(user.first_name?.[0] || '').toUpperCase()}{(user.last_name?.[0] || '').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.role && (
                            <Badge variant="outline">{user.role}</Badge>
                          )}
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Assigned {format(new Date(user.assigned_at), 'MMM dd, yyyy')}
                            </p>
                            {user.assigned_by && (
                              <p className="text-xs text-muted-foreground">
                                by {user.assigned_by.first_name} {user.assigned_by.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="available" className="space-y-4">
              <ScrollArea className="h-96">
                {unassignedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">All users are already assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unassignedUsers
                      .filter(user =>
                        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                              <AvatarFallback>
                                {(user.first_name?.[0] || '').toUpperCase()}{(user.last_name?.[0] || '').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.first_name} {user.last_name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.role && (
                              <Badge variant="outline">{user.role}</Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsAssignmentDialogOpen(true)}
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Assignment Dialog */}
      {id && (
        <UserAssignmentDialog
          isOpen={isAssignmentDialogOpen}
          onClose={() => setIsAssignmentDialogOpen(false)}
          carrierId={id}
          carrierName={carrier.company_name}
          onAssignmentChange={handleAssignmentChange}
        />
      )}
    </div>
  );
}
