import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useAuth } from '@/components/auth/auth-context';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText,
  Loader2,
  Calendar,
  User,
  Truck,
  Mail,
  Phone,
  MapPin,
  Percent
} from 'lucide-react';
import { format } from 'date-fns';
import followupSheetApi, { FollowupSheet, FollowupSheetFormData } from '@/services/followupSheetApi';

const initialFormData: FollowupSheetFormData = {
  agent_name: '',
  date: new Date().toISOString(), // Current date/time in ISO format
  name: '',
  mc_no: '',
  contact: '',
  email: '',
  truck_type: '',
  preferred_lanes: '',
  equipment: '',
  zip_code: '',
  percentage: 0,
  comments: '',
  followup_status: 'required',
  followup_scheduled_date: null,
  followup_scheduled_time: null
};

// Move FormDialog component outside to prevent re-creation on every render
const FormDialog = React.memo(({ 
  isOpen, 
  onOpenChange, 
  title, 
  description, 
  formData, 
  onInputChange, 
  onSubmit, 
  submitting, 
  editingSheet, 
  onCancel,
  currentUser
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formData: FollowupSheetFormData;
  onInputChange: (field: keyof FollowupSheetFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingSheet: FollowupSheet | null;
  onCancel: () => void;
  currentUser: any;
}) => {
  
  // Auto-populate agent name from current user on component mount or when currentUser changes
  React.useEffect(() => {
    if (currentUser && !formData.agent_name) {
      const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
      if (fullName) {
        onInputChange('agent_name', fullName);
      }
    }
  }, [currentUser, formData.agent_name, onInputChange]);
  
  const handleDateTimeChange = (date: Date | undefined) => {
    if (date) {
      onInputChange('date', date.toISOString());
    }
  };
  
  const handleFollowupDateChange = (date: Date | undefined) => {
    if (date) {
      onInputChange('followup_scheduled_date', format(date, 'yyyy-MM-dd'));
      onInputChange('followup_scheduled_time', format(date, 'HH:mm'));
    } else {
      onInputChange('followup_scheduled_date', '');
      onInputChange('followup_scheduled_time', '');
    }
  };

  const getFollowupDateTime = () => {
    if (formData.followup_scheduled_date && formData.followup_scheduled_time) {
      try {
        const dateTime = new Date(`${formData.followup_scheduled_date}T${formData.followup_scheduled_time}`);
        if (isNaN(dateTime.getTime())) return undefined;
        return dateTime;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  };

  return (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">          <div className="space-y-2">
            <Label htmlFor="agent_name">Agent Name</Label>
            <Input
              id="agent_name"
              value={formData.agent_name}
              onChange={(e) => onInputChange('agent_name', e.target.value)}
              placeholder="Agent Name"
              // disabled={!!currentUser}
              required
            />
          </div>
          
          <div>
            <DateTimePicker
              date={formData.date ? new Date(formData.date) : new Date()}
              onDateChange={handleDateTimeChange}
              showTime={true}
              placeholder="Select date and time"
              label="Date Created"
              required
              clearable={false}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mc_no">MC Number</Label>
            <Input
              id="mc_no"
              value={formData.mc_no}
              onChange={(e) => onInputChange('mc_no', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => onInputChange('contact', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="truck_type">Truck Type</Label>
            <Input
              id="truck_type"
              value={formData.truck_type}
              onChange={(e) => onInputChange('truck_type', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment</Label>
            <Input
              id="equipment"
              value={formData.equipment}
              onChange={(e) => onInputChange('equipment', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferred_lanes">Preferred Lanes</Label>
            <Input
              id="preferred_lanes"
              value={formData.preferred_lanes}
              onChange={(e) => onInputChange('preferred_lanes', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zip_code">Zip Code</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => onInputChange('zip_code', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="percentage">Percentage (%)</Label>
            <Input
              id="percentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.percentage}
              onChange={(e) => onInputChange('percentage', parseFloat(e.target.value) || 0)}
              required
            />
          </div>        </div>
        
        {/* Follow-up Status Section */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Follow-up Management</h3>
          
          <div className="space-y-3">
            <Label>Follow-up Status</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant={formData.followup_status === 'required' ? 'default' : 'outline'}
                size="sm"
                className={`${
                  formData.followup_status === 'required'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'text-red-500 border-red-500 hover:bg-red-50'
                }`}
                onClick={() => onInputChange('followup_status', 'required')}
              >
                Followup Required
              </Button>
              <Button
                type="button"
                variant={formData.followup_status === 'rescheduled' ? 'default' : 'outline'}
                size="sm"
                className={`${
                  formData.followup_status === 'rescheduled'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'text-yellow-600 border-yellow-500 hover:bg-yellow-50'
                }`}
                onClick={() => onInputChange('followup_status', 'rescheduled')}
              >
                Follow-up Re-scheduled
              </Button>
              <Button
                type="button"
                variant={formData.followup_status === 'complete' ? 'default' : 'outline'}
                size="sm"
                className={`${
                  formData.followup_status === 'complete'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'text-green-600 border-green-500 hover:bg-green-50'
                }`}
                onClick={() => onInputChange('followup_status', 'complete')}
              >
                Follow-up Complete
              </Button>
            </div>
          </div>          {/* Follow-up Scheduling */}          {(formData.followup_status === 'required' || formData.followup_status === 'rescheduled') && (
            <div className="space-y-4 mt-4">
              <div>
                <DateTimePicker
                  date={getFollowupDateTime()}
                  onDateChange={handleFollowupDateChange}
                  showTime={true}
                  placeholder="Select follow-up date and time"
                  label="Follow-up Date & Time"
                  required={true}
                  error={!getFollowupDateTime() ? "Please set a follow-up date and time" : undefined}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="comments">Comments</Label>
          <Textarea
            id="comments"
            value={formData.comments}
            onChange={(e) => onInputChange('comments', e.target.value)}
            rows={3}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editingSheet ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingSheet ? 'Update' : 'Create'
            )}
          </Button>        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)});

export default function FollowupSheets() {
  const [followupSheets, setFollowupSheets] = useState<FollowupSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<FollowupSheet | null>(null);  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Create initial form data with current user's name
  const getInitialFormData = useCallback((): FollowupSheetFormData => ({
    agent_name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '',
    date: new Date().toISOString(), // Current date/time in ISO format
    name: '',
    mc_no: '',
    contact: '',
    email: '',
    truck_type: '',
    preferred_lanes: '',
    equipment: '',
    zip_code: '',
    percentage: 0,
    comments: '',
    followup_status: 'required',
    followup_scheduled_date: null,
    followup_scheduled_time: null
  }), [currentUser]);
  
  const [formData, setFormData] = useState<FollowupSheetFormData>(getInitialFormData);
  const [submitting, setSubmitting] = useState(false);
  
  // Update formData when currentUser changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      agent_name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : prev.agent_name
    }));
  }, [currentUser]);

  useEffect(() => {
    fetchFollowupSheets();
  }, []);

  const fetchFollowupSheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const sheets = await followupSheetApi.getAll();
      setFollowupSheets(sheets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load followup sheets';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Use useCallback to prevent re-creation on every render
  const handleInputChange = useCallback((field: keyof FollowupSheetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {      setSubmitting(true);
      
      if (editingSheet) {
        const updatedSheet = await followupSheetApi.update(editingSheet.id, formData);
        setFollowupSheets(prev => prev.map(sheet => 
          sheet.id === editingSheet.id ? updatedSheet : sheet
        ));
        setIsEditDialogOpen(false);
        setEditingSheet(null);
        toast({
          title: "Success",
          description: "Followup sheet updated successfully",
        });
      } else {
        const newSheet = await followupSheetApi.create(formData);
        setFollowupSheets(prev => [newSheet, ...prev]);
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Followup sheet created successfully",
        });
      }
      
      setFormData(initialFormData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save followup sheet';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit = (sheet: FollowupSheet) => {
    setEditingSheet(sheet);
    setFormData({
      agent_name: sheet.agent_name,
      date: sheet.date,
      name: sheet.name,
      mc_no: sheet.mc_no,
      contact: sheet.contact,
      email: sheet.email,
      truck_type: sheet.truck_type,
      preferred_lanes: sheet.preferred_lanes,
      equipment: sheet.equipment,
      zip_code: sheet.zip_code,
      percentage: sheet.percentage,
      comments: sheet.comments,
      followup_status: sheet.followup_status || 'required',
      followup_scheduled_date: sheet.followup_scheduled_date || null,
      followup_scheduled_time: sheet.followup_scheduled_time || null    });
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (id: number) => {
    try {
      await followupSheetApi.delete(id);
      setFollowupSheets(prev => prev.filter(sheet => sheet.id !== id));
      toast({
        title: "Success",
        description: "Followup sheet deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete followup sheet';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };  const handleCancel = useCallback(() => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setFormData(getInitialFormData());
    setEditingSheet(null);
  }, [getInitialFormData]);
  // Memoize filtered sheets to prevent unnecessary re-calculations
  const filteredSheets = useMemo(() => 
    followupSheets.filter(sheet =>
      sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.mc_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [followupSheets, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Followup Sheets</h1>
          <p className="text-muted-foreground">
            Manage carrier followup sheets and contact information
          </p>
        </div>        <Button onClick={() => {
          // Reset form with fresh data including current timestamp
          const freshData = getInitialFormData();
          setFormData(freshData);
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Followup Sheet
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name, MC number, or agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Followup Sheets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Followup Sheets</CardTitle>
          <CardDescription>
            {filteredSheets.length} of {followupSheets.length} sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading followup sheets...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchFollowupSheets} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredSheets.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No followup sheets</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No sheets match your search.' : 'Get started by creating a new followup sheet.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">                  <Button onClick={() => {
                    setFormData(getInitialFormData());
                    setIsCreateDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Followup Sheet
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>MC Number</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Follow-up Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader><TableBody>
                  {filteredSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm">{sheet.agent_name}</span>
                        </div>
                      </TableCell>                      <TableCell className="min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="text-sm">{format(new Date(sheet.date), 'MMM dd, yyyy')}</span>
                            {sheet.date.includes('T') && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(sheet.date), 'h:mm a')}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{sheet.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>{sheet.zip_code}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <Badge variant="outline" className="text-xs">{sheet.mc_no}</Badge>
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{sheet.contact}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{sheet.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium">{sheet.truck_type}</span>
                          </div>
                          <div className="text-xs text-muted-foreground pl-4">{sheet.equipment}</div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[80px]">
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm">{sheet.percentage}%</span>
                        </div>                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="space-y-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              (sheet.followup_status || 'required') === 'required'
                                ? 'border-red-500 text-red-600 bg-red-50'
                                : (sheet.followup_status || 'required') === 'rescheduled'
                                ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                : 'border-green-500 text-green-600 bg-green-50'
                            }`}
                          >
                            {(sheet.followup_status || 'required') === 'required' && 'Followup Required'}
                            {(sheet.followup_status || 'required') === 'rescheduled' && 'Re-scheduled'}
                            {(sheet.followup_status || 'required') === 'complete' && 'Complete'}
                          </Badge>
                          {sheet.followup_scheduled_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span>
                                {format(new Date(sheet.followup_scheduled_date), 'MMM dd')}
                                {sheet.followup_scheduled_time && ` at ${sheet.followup_scheduled_time}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[50px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(sheet)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Followup Sheet</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this followup sheet for {sheet.name}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(sheet.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>      {/* Dialogs */}
      <FormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Create Followup Sheet"
        description="Add a new carrier followup sheet with contact and equipment information."
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        editingSheet={editingSheet}
        onCancel={handleCancel}
        currentUser={currentUser}
      />

      <FormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Followup Sheet"
        description="Update the carrier followup sheet information."
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        editingSheet={editingSheet}
        onCancel={handleCancel}
        currentUser={currentUser}
      />
    </div>
  );
}
