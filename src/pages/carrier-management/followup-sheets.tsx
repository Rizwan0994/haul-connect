import React, { useState, useEffect } from 'react';
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
  date: new Date().toISOString().split('T')[0],
  name: '',
  mc_no: '',
  contact: '',
  email: '',
  truck_type: '',
  preferred_lanes: '',
  equipment: '',
  zip_code: '',
  percentage: 0,
  comments: ''
};

export default function FollowupSheets() {
  const [followupSheets, setFollowupSheets] = useState<FollowupSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<FollowupSheet | null>(null);
  const [formData, setFormData] = useState<FollowupSheetFormData>(initialFormData);  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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

  const handleInputChange = (field: keyof FollowupSheetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      comments: sheet.comments
    });
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
  };

  const filteredSheets = followupSheets.filter(sheet =>
    sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.mc_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FormDialog = ({ isOpen, onOpenChange, title, description }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent_name">Agent Name</Label>
              <Input
                id="agent_name"
                value={formData.agent_name}
                onChange={(e) => handleInputChange('agent_name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mc_no">MC Number</Label>
              <Input
                id="mc_no"
                value={formData.mc_no}
                onChange={(e) => handleInputChange('mc_no', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="truck_type">Truck Type</Label>
              <Input
                id="truck_type"
                value={formData.truck_type}
                onChange={(e) => handleInputChange('truck_type', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={formData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_lanes">Preferred Lanes</Label>
              <Input
                id="preferred_lanes"
                value={formData.preferred_lanes}
                onChange={(e) => handleInputChange('preferred_lanes', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
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
                onChange={(e) => handleInputChange('percentage', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setFormData(initialFormData);
                setEditingSheet(null);
              }}
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
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Followup Sheets</h1>
          <p className="text-muted-foreground">
            Manage carrier followup sheets and contact information
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                <div className="mt-6">
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Followup Sheet
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>MC Number</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{sheet.agent_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(sheet.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sheet.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{sheet.zip_code}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sheet.mc_no}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{sheet.contact}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{sheet.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center space-x-1">
                            <Truck className="h-3 w-3" />
                            <span className="text-sm">{sheet.truck_type}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{sheet.equipment}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Percent className="h-3 w-3" />
                          <span className="font-medium">{sheet.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
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
      </Card>

      {/* Dialogs */}
      <FormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Create Followup Sheet"
        description="Add a new carrier followup sheet with contact and equipment information."
      />

      <FormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Followup Sheet"
        description="Update the carrier followup sheet information."
      />
    </div>
  );
}
