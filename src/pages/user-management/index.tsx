import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, MoreHorizontal, Pencil, Trash2, Search, KeyRound } from 'lucide-react';
import { userAPI, User, CreateUserRequest, UpdateUserRequest } from '@/lib/user-api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchAvailableRoles } from '@/lib/user-management';
import PermissionGate from '@/components/auth/permission-gate';

// Legacy categories removed - now using permission-based roles only

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRoles, setAvailableRoles] = useState<{ value: string, label: string }[]>([]);
  // Form state
  const [formData, setFormData] = useState<CreateUserRequest & { id?: number }>({
    email: '',
    password: '',
    category: 'Dispatch',      // Legacy category - still needed for backend compatibility
    role_id: undefined,        // New role system
    basic_salary: 500,
    first_name: '',
    last_name: '',
    phone: '',
  });
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadRoles = async () => {
    try {
      const roles = await fetchAvailableRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };
  const handleCreateUser = async () => {
    try {
      setError('');
      
      // Validate required fields
      if (!formData.email || !formData.password || !formData.role_id) {
        setError('Email, password, and role are required');
        return;
      }
      
      const { id, ...userData } = formData;
      
      // Map role_id to category for backward compatibility
      const selectedRole = availableRoles.find(role => Number(role.value) === formData.role_id);
      const mappedCategory = selectedRole?.label || 'Dispatch'; // Default fallback
      
      // Prepare user data with mapped category
      const userDataWithCategory = {
        ...userData,
        category: mappedCategory as User['category']
      };
      
      await userAPI.createUser(userDataWithCategory);
      setSuccess('User created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create user');
    }
  };
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      setError('');
      
      // Validate required fields
      if (!formData.email || !formData.role_id) {
        setError('Email and role are required');
        return;
      }
      
      const { id, password, ...userData } = formData;
      const updateData: UpdateUserRequest = userData;
      
      // Only include password if it's provided
      if (password) {
        updateData.password = password;
      }
      
      // Map role_id to category for backward compatibility
      const selectedRole = availableRoles.find(role => Number(role.value) === formData.role_id);
      const mappedCategory = selectedRole?.label || editingUser.category;
      updateData.category = mappedCategory as User['category'];
      
      await userAPI.updateUser(editingUser.id, updateData);
      setSuccess('User updated successfully');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setError('');
      await userAPI.deleteUser(userId);
      setSuccess('User deleted successfully');
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      setError('');
      await userAPI.updateUserStatus(user.id, !user.is_active);
      setSuccess(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update user status');
    }
  };  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password
      category: user.category, // Legacy category - still needed for backend compatibility
      role_id: user.role_id,
      basic_salary: user.basic_salary,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
    });
    setIsEditDialogOpen(true);
  };  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      category: 'Dispatch',    // Legacy category - still needed for backend compatibility
      role_id: availableRoles.length > 0 ? Number(availableRoles[0].value) : undefined,  // New role system
      basic_salary: 500,
      first_name: '',
      last_name: '',
      phone: '',
    });
  };
  const getCategoryLabel = (category: string) => {
    // Map legacy categories to display names
    const categoryMap: { [key: string]: string } = {
      'Admin': 'Admin',
      'Super Admin': 'Super Admin', 
      'Dispatch': 'Dispatch',
      'Sales': 'Sales',
      'Account': 'Account',
      'Manager': 'Manager'
    };
    return categoryMap[category] || category;
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            {/* <PermissionGate requiredPermission="users.create"> */}
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            {/* </PermissionGate> */}
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />              </div>
              
              <div className="pt-2 border-t">
                <Label htmlFor="role_id" className="flex items-center gap-1">
                  <KeyRound className="h-3 w-3" />
                  <span>Category Role *</span>
                </Label>
                <Select 
                  value={formData.role_id?.toString() || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  This determines the user's permissions in the system
                </p>
              </div>
              <div>
                <Label htmlFor="basic_salary">Basic Salary</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">
                      {user.role_name ? (
                        <div className="flex items-center gap-1">
                          <KeyRound className="h-3 w-3 text-primary" />
                          <span>{user.role_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No role assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>${user.basic_salary}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <PermissionGate requiredPermission="users.edit">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionGate>
                          <PermissionGate requiredPermission="users.status">
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                              <Switch className="h-4 w-4 mr-2" />
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          </PermissionGate>
                          <DropdownMenuSeparator />
                          <PermissionGate requiredPermission="users.delete">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_password">New Password (leave blank to keep current)</Label>
              <Input
                id="edit_password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />              </div>
            
            <div className="pt-2 border-t">
              <Label htmlFor="edit_role_id" className="flex items-center gap-1">
                <KeyRound className="h-3 w-3" />
                <span>Role *</span>
              </Label>
              <Select 
                value={formData.role_id?.toString() || ""} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                This determines the user's permissions in the system
              </p>
            </div>
            <div>
              <Label htmlFor="edit_basic_salary">Basic Salary</Label>
              <Input
                id="edit_basic_salary"
                type="number"
                value={formData.basic_salary}
                onChange={(e) => setFormData(prev => ({ ...prev, basic_salary: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
