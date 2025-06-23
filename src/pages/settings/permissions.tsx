import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
// Ensure we're importing the latest version of the APIs
import { roleAPI, permissionAPI, Role, Permission } from '@/lib/permission-api';

// Permission Management Page
export default function PermissionManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    module: 'all',
    type: 'all',
    search: ''
  });  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    guard_name: 'api',
    description: ''
  });
  const [loadingOperations, setLoadingOperations] = useState<Record<string, boolean>>({});// Fetch all data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load roles
        const rolesData = await roleAPI.getAllRoles();
        setRoles(rolesData);
        
        // Set first role as selected by default (only on initial load)
        if (rolesData.length > 0 && !selectedRole) {
          setSelectedRole(rolesData[0]);
        }
        
        // Load permission types and modules (these are relatively static)
        const typesData = await permissionAPI.getPermissionTypes();
        setTypes(typesData);
        
        const modulesData = await permissionAPI.getPermissionModules();
        setModules(modulesData);
      } catch (error) {
        console.error('Error loading roles and metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Fetch permissions separately when filter changes
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {        // Get permissions with current filters
        const filters: Record<string, string> = {};
        if (filter.module !== 'all') filters['module'] = filter.module;
        if (filter.type !== 'all') filters['type'] = filter.type;
        
        const permissionsData = await permissionAPI.getAllPermissions(filters);
        setPermissions(permissionsData);
        
      } catch (error) {
        console.error('Error loading permissions with filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [filter.module, filter.type]);

  // Handle role selection
  const handleRoleSelect = async (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setIsLoading(true);
      try {
        // Fetch role with permissions
        const roleWithPermissions = await roleAPI.getRoleById(roleId);
        setSelectedRole(roleWithPermissions);
      } catch (error) {
        console.error('Error loading role permissions:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const moduleMatch = filter.module === 'all' || permission.module === filter.module;
    const typeMatch = filter.type === 'all' || permission.type === filter.type;
    const searchMatch = filter.search === '' || 
      permission.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      (permission.description?.toLowerCase().includes(filter.search.toLowerCase()) || false);
    
    return moduleMatch && typeMatch && searchMatch;
  });

  // Check if role has permission
  const hasPermission = (permissionId: number) => {
    return selectedRole?.permissions.some(p => p.id === permissionId) || false;
  };  // Toggle permission for a role
  const togglePermission = async (permissionId: number) => {
    if (!selectedRole) return;

    const hasPermissionNow = hasPermission(permissionId);
    
    try {
      if (hasPermissionNow) {
        // Remove permission from role
        await roleAPI.removePermissionFromRole(selectedRole.id, permissionId);
      } else {
        // Add permission to role
        // Check if the method exists before calling it
        if (typeof roleAPI.addPermissionToRole !== 'function') {
          console.error('addPermissionToRole function is not available');
          return;
        }
        await roleAPI.addPermissionToRole(selectedRole.id, permissionId);
      }
        // Refresh role data
      const updatedRole = await roleAPI.getRoleById(selectedRole.id);
      setSelectedRole(updatedRole);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Error updating permission. Please try again.');
    }
  };  // Enable all permissions for a specific module
  const enableAllModulePermissions = async (module: string, modulePermissions: Permission[]) => {
    if (!selectedRole) return;

    const operationKey = `enable-${module}`;
    setLoadingOperations(prev => ({ ...prev, [operationKey]: true }));

    try {
      // Get permissions that are not already enabled for this role
      const permissionsToEnable = modulePermissions.filter(permission => 
        !hasPermission(permission.id)
      );

      if (permissionsToEnable.length === 0) {
        // All permissions are already enabled
        return;
      }

      // Add all missing permissions to the role
      for (const permission of permissionsToEnable) {
        if (typeof roleAPI.addPermissionToRole !== 'function') {
          console.error('addPermissionToRole function is not available');
          return;
        }
        await roleAPI.addPermissionToRole(selectedRole.id, permission.id);
      }
        // Refresh role data
      const updatedRole = await roleAPI.getRoleById(selectedRole.id);
      setSelectedRole(updatedRole);
      
      toast.success(`Enabled ${permissionsToEnable.length} permissions for ${module} module`);
    } catch (error) {
      console.error('Error enabling all module permissions:', error);
      toast.error('Error enabling all permissions. Please try again.');
    } finally {
      setLoadingOperations(prev => ({ ...prev, [operationKey]: false }));
    }
  };

  // Disable all permissions for a specific module
  const disableAllModulePermissions = async (module: string, modulePermissions: Permission[]) => {
    if (!selectedRole) return;

    const operationKey = `disable-${module}`;
    setLoadingOperations(prev => ({ ...prev, [operationKey]: true }));

    try {
      // Get permissions that are currently enabled for this role
      const permissionsToDisable = modulePermissions.filter(permission => 
        hasPermission(permission.id)
      );

      if (permissionsToDisable.length === 0) {
        // All permissions are already disabled
        return;
      }

      // Remove all enabled permissions from the role
      for (const permission of permissionsToDisable) {
        await roleAPI.removePermissionFromRole(selectedRole.id, permission.id);
      }
        // Refresh role data
      const updatedRole = await roleAPI.getRoleById(selectedRole.id);
      setSelectedRole(updatedRole);
      
      toast.success(`Disabled ${permissionsToDisable.length} permissions for ${module} module`);
    } catch (error) {
      console.error('Error disabling all module permissions:', error);
      toast.error('Error disabling all permissions. Please try again.');
    } finally {
      setLoadingOperations(prev => ({ ...prev, [operationKey]: false }));
    }
  };
  // Enable all permissions for the selected role
  const enableAllPermissions = async () => {
    if (!selectedRole) return;

    setLoadingOperations(prev => ({ ...prev, 'enable-all': true }));

    try {
      // Get all permissions that are not already enabled for this role
      const permissionsToEnable = filteredPermissions.filter(permission => 
        !hasPermission(permission.id)
      );

      if (permissionsToEnable.length === 0) {
        toast.info('All permissions are already enabled for this role');
        return;
      }

      // Add all missing permissions to the role
      for (const permission of permissionsToEnable) {
        if (typeof roleAPI.addPermissionToRole !== 'function') {
          console.error('addPermissionToRole function is not available');
          return;
        }
        await roleAPI.addPermissionToRole(selectedRole.id, permission.id);
      }
      
      // Refresh role data
      const updatedRole = await roleAPI.getRoleById(selectedRole.id);
      setSelectedRole(updatedRole);
      
      toast.success(`Enabled ${permissionsToEnable.length} permissions for ${selectedRole.name}`);
    } catch (error) {
      console.error('Error enabling all permissions:', error);
      toast.error('Error enabling all permissions. Please try again.');
    } finally {
      setLoadingOperations(prev => ({ ...prev, 'enable-all': false }));
    }
  };

  // Disable all permissions for the selected role
  const disableAllPermissions = async () => {
    if (!selectedRole) return;

    setLoadingOperations(prev => ({ ...prev, 'disable-all': true }));

    try {
      // Get all permissions that are currently enabled for this role
      const permissionsToDisable = filteredPermissions.filter(permission => 
        hasPermission(permission.id)
      );

      if (permissionsToDisable.length === 0) {
        toast.info('All permissions are already disabled for this role');
        return;
      }

      // Remove all enabled permissions from the role
      for (const permission of permissionsToDisable) {
        await roleAPI.removePermissionFromRole(selectedRole.id, permission.id);
      }
      
      // Refresh role data
      const updatedRole = await roleAPI.getRoleById(selectedRole.id);
      setSelectedRole(updatedRole);
      
      toast.success(`Disabled ${permissionsToDisable.length} permissions for ${selectedRole.name}`);
    } catch (error) {
      console.error('Error disabling all permissions:', error);
      toast.error('Error disabling all permissions. Please try again.');
    } finally {
      setLoadingOperations(prev => ({ ...prev, 'disable-all': false }));
    }
  };

  // Create new role
  const handleCreateRole = async () => {
    try {
      await roleAPI.createRole(newRole);
      setShowNewRoleDialog(false);
      
      // Reset form
      setNewRole({
        name: '',
        guard_name: 'api',
        description: ''
      });
        // Reload roles
      const rolesData = await roleAPI.getAllRoles();
      setRoles(rolesData);
      
      toast.success(`Role "${newRole.name}" created successfully`);
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error creating role. Please try again.');
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId: number) => {
    try {
      await roleAPI.deleteRole(roleId);
      
      // If the deleted role was selected, clear selection
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
      
      // Reload roles
      const rolesData = await roleAPI.getAllRoles();
      setRoles(rolesData);
        // Set first role as selected if none selected
      if (rolesData.length > 0 && (!selectedRole || selectedRole.id === roleId)) {
        setSelectedRole(rolesData[0]);
      }
      
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error deleting role. Please try again.');
    }
  };

  // Group permissions by module for the grid view
  const groupedByModule = filteredPermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>Manage roles and permissions for users</CardDescription>
          </div>
          <Dialog open={showNewRoleDialog} onOpenChange={setShowNewRoleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Create New Role</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Add a new role to the system. This role can then be assigned to users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roleName" className="text-right">
                    Role Name
                  </Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roleDescription" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewRoleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1">            <div className="space-y-4">
              <div className="font-medium">Roles</div>
              <div className="space-y-2">                {roles.map(role => (
                  <div key={role.id} className="flex items-center gap-2">
                    <Button
                      variant={selectedRole?.id === role.id ? "default" : "outline"}
                      className="flex-1 justify-start"
                      onClick={() => handleRoleSelect(role.id)}
                    >
                      {role.name}
                    </Button>
                    {/* Show delete button for all roles */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the role "{role.name}"? 
                            This action cannot be undone and will remove all permissions associated with this role.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRole(role.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Role
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">
                    Permissions for {selectedRole?.name || 'No Role Selected'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage access permissions for this role
                  </p>
                </div>
                {selectedRole && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enableAllPermissions}
                      disabled={!selectedRole || 
                               (selectedRole?.is_system_role && selectedRole.name === 'admin') ||
                               loadingOperations['enable-all'] ||
                               loadingOperations['disable-all']}
                      className="h-8 px-3 text-xs"
                    >
                      {loadingOperations['enable-all'] ? (
                        <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-2" />
                      ) : null}
                      Enable All Permissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disableAllPermissions}
                      disabled={!selectedRole || 
                               (selectedRole?.is_system_role && selectedRole.name === 'admin') ||
                               loadingOperations['enable-all'] ||
                               loadingOperations['disable-all']}
                      className="h-8 px-3 text-xs"
                    >
                      {loadingOperations['disable-all'] ? (
                        <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-2" />
                      ) : null}
                      Disable All Permissions
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="moduleFilter">Module</Label>
                    <Select 
                      value={filter.module} 
                      onValueChange={(value) => setFilter({...filter, module: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        {modules.map(module => (
                          <SelectItem key={module} value={module}>
                            {module}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="typeFilter">Permission Type</Label>
                    <Select 
                      value={filter.type} 
                      onValueChange={(value) => setFilter({...filter, type: value})}
                    >
                      <SelectTrigger className="relative">
                        <SelectValue placeholder="Select Type" />
                        {filter.type !== 'all' && (
                          <span className={`absolute right-8 px-1.5 py-0.5 rounded-md text-xs font-medium ${
                            filter.type === 'feature' ? 'bg-blue-100 text-blue-800' : 
                            filter.type === 'route' ? 'bg-green-100 text-green-800' : 
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {filter.type}
                          </span>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map(type => (
                          <SelectItem key={type} value={type} className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              type === 'feature' ? 'bg-blue-500' : 
                              type === 'route' ? 'bg-green-500' : 
                              'bg-purple-500'
                            }`}></span>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="searchFilter">Search</Label>
                    <Input
                      id="searchFilter"
                      value={filter.search}
                      onChange={(e) => setFilter({...filter, search: e.target.value})}
                      placeholder="Search permissions..."
                    />
                  </div>
                </div>
                
                {filter.type !== 'all' && (
                  <div className="bg-muted/40 p-3 rounded-md text-sm">
                    <strong className="font-medium">
                      {filter.type === 'feature' ? 'Feature Permissions: ' : 
                       filter.type === 'route' ? 'Route Permissions: ' :
                       'Column Permissions: '}
                    </strong>
                    <span className="text-muted-foreground">
                      {filter.type === 'feature' ? 'Control access to specific features and actions' : 
                       filter.type === 'route' ? 'Control access to pages and sidebar menu visibility' :
                       'Control visibility of data columns in tables and forms'}
                    </span>
                  </div>
                )}
              </div>

              {/* Permission Grid View */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Permission</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead className="w-[100px]">Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>                    {Object.entries(groupedByModule).map(([module, modulePermissions]) => (
                      <React.Fragment key={module}>                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={2} className="font-medium py-2">
                            {module}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className="text-xs text-muted-foreground">
                              {modulePermissions.filter(p => hasPermission(p.id)).length}/{modulePermissions.length} enabled
                            </span>
                          </TableCell>                          <TableCell className="py-2">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => enableAllModulePermissions(module, modulePermissions)}
                                disabled={!selectedRole || 
                                         (selectedRole?.is_system_role && selectedRole.name === 'admin') || 
                                         modulePermissions.every(p => hasPermission(p.id)) ||
                                         loadingOperations[`enable-${module}`] ||
                                         loadingOperations[`disable-${module}`]}
                                className="h-7 px-2 text-xs"
                              >
                                {loadingOperations[`enable-${module}`] ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                                ) : (
                                  'Enable All'
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => disableAllModulePermissions(module, modulePermissions)}
                                disabled={!selectedRole || 
                                         (selectedRole?.is_system_role && selectedRole.name === 'admin') || 
                                         modulePermissions.every(p => !hasPermission(p.id)) ||
                                         loadingOperations[`enable-${module}`] ||
                                         loadingOperations[`disable-${module}`]}
                                className="h-7 px-2 text-xs"
                              >
                                {loadingOperations[`disable-${module}`] ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                                ) : (
                                  'Disable All'
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {modulePermissions.map(permission => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                              {permission.name}
                            </TableCell>
                            <TableCell>
                              {permission.description}
                            </TableCell>                            <TableCell>
                              <span className={`capitalize px-2 py-1 rounded-md text-xs font-medium ${
                                permission.type === 'feature' ? 'bg-blue-100 text-blue-800' : 
                                permission.type === 'route' ? 'bg-green-100 text-green-800' : 
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {permission.type}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={hasPermission(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                disabled={selectedRole?.is_system_role && selectedRole.name === 'admin'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    {Object.keys(groupedByModule).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No permissions found matching the current filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
