import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Mail, Send, X, UserCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { notificationService, User as ServiceUser } from '@/lib/notification-service';

interface User {
  id: number;
  email: string;
  first_name: string | null;  last_name: string | null;
  category: string | null;
  userRole?: {
    id: number;
    name: string;
    description?: string;
  } | null;
}

interface CreateNotificationFormProps {
  onNotificationSent: () => void;
}

export function CreateNotificationForm({ onNotificationSent }: CreateNotificationFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    link: ''
  });
  const { toast } = useToast();

  // Fetch users for selection
  useEffect(() => {
    fetchUsers();
  }, []);  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const serviceUsers = await notificationService.getAllUsersForNotification();      // Convert ServiceUser to local User format
      const convertedUsers: User[] = (serviceUsers || []).map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        category: user.category || null,
        userRole: (user as any).userRole || null
      }));
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users',
      });
    } finally {
      setLoadingUsers(false);
    }
  };  // Helper function to get user's role name
  const getUserRole = useCallback((user: User): string => {
    return user.userRole?.name || user.category || 'No Role';
  }, []);

  // Memoized filtered users computation
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const userRole = getUserRole(user).toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        userRole.includes(searchLower)
      );
    });
  }, [users, searchTerm, getUserRole]);

const handleUserToggle = useCallback((userId: number) => {
  setSelectedUsers(prev => {
    const newSelected = prev.includes(userId)
      ? prev.filter(id => id !== userId)
      : [...prev, userId];
    return newSelected;
  });
}, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  }, [selectedUsers.length, filteredUsers]);

  const handleSelectByRole = useCallback((role: string) => {
    const roleUsers = filteredUsers.filter(user => getUserRole(user) === role);
    const roleUserIds = roleUsers.map(user => user.id);
    
    // Check if all users of this role are already selected
    const allRoleUsersSelected = roleUserIds.every(id => selectedUsers.includes(id));
    
    if (allRoleUsersSelected) {
      // Deselect all users of this role
      setSelectedUsers(prev => prev.filter(id => !roleUserIds.includes(id)));
    } else {
      // Select all users of this role
      setSelectedUsers(prev => [...new Set([...prev, ...roleUserIds])]);
    }
  }, [filteredUsers, selectedUsers, getUserRole]);
  const addEmail = useCallback(() => {
    if (emailInput && !additionalEmails.includes(emailInput)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(emailInput)) {
        setAdditionalEmails(prev => [...prev, emailInput]);
        setEmailInput('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Email',
          description: 'Please enter a valid email address',
        });
      }
    }
  }, [emailInput, additionalEmails, toast]);

  const removeEmail = useCallback((email: string) => {
    setAdditionalEmails(prev => prev.filter(e => e !== email));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Message is required',
      });
      return;
    }

    if (selectedUsers.length === 0 && additionalEmails.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one recipient',
      });
      return;
    }    try {
      setLoading(true);
      
      // Prepare notification data
      const notificationData = {
        title: formData.title || 'Custom Notification',
        message: formData.message,
        type: formData.type as 'info' | 'warning' | 'error' | 'success',
        user_ids: selectedUsers,
        link: formData.link || undefined,
      };

      await notificationService.sendCustomNotification(notificationData);
      
      toast({
        title: 'Success',
        description: `Notification sent to ${selectedUsers.length + additionalEmails.length} recipients`,
      });
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        link: ''
      });
      setSelectedUsers([]);
      setAdditionalEmails([]);
      setEmailInput('');
      
      onNotificationSent();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send notification',
      });
    } finally {
      setLoading(false);
    }
  };
  // Memoized unique roles computation
  const getUniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    users.forEach(user => {
      const userRole = getUserRole(user);
      if (userRole && userRole !== 'No Role') {
        roles.add(userRole);
      }
    });
    return Array.from(roles);
  }, [users, getUserRole]);

  // Memoized role data for buttons
  const roleData = useMemo(() => {
    return getUniqueRoles.map(role => {
      const roleUsers = filteredUsers.filter(user => getUserRole(user) === role);
      const roleUserIds = roleUsers.map(user => user.id);
      const allSelected = roleUserIds.every(id => selectedUsers.includes(id));
      
      return {
        name: role,
        users: roleUsers,
        userIds: roleUserIds,
        allSelected,
        count: roleUsers.length
      };
    });
  }, [getUniqueRoles, filteredUsers, selectedUsers, getUserRole]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notification Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            placeholder="Notification title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Notification Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          placeholder="Enter your notification message..."
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link (Optional)</Label>
        <Input
          id="link"
          placeholder="/path/to/page or https://example.com"
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
        />
      </div>

      <Separator />

      {/* User Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Select Recipients</h3>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
          </Button>
          {roleData.map(role => (
            <Button
              key={role.name}
              type="button"
              variant={role.allSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleSelectByRole(role.name)}
            >
              {role.allSelected ? 'Deselect' : 'Select'} {role.name}s ({role.count})
            </Button>
          ))}
        </div>

        {/* User Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* User List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading users...</div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">No users found</div>
                </div>
              ) : (                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.first_name || ''} {user.last_name || ''}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getUserRole(user)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Additional Emails */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional Email Recipients</CardTitle>
            <CardDescription>
              Add email addresses for external recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                  className="pl-10"
                />
              </div>
              <Button type="button" onClick={addEmail}>
                Add
              </Button>
            </div>
            
            {additionalEmails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {additionalEmails.map(email => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeEmail(email)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
