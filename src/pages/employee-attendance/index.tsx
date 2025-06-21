import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Users, UserCheck, UserX, Plus, Calendar, Filter, ClipboardList } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { createAttendanceColumns, AttendanceRecord } from './attendance-columns';
import { attendanceApi } from '../../services/attendanceApi';

export default function EmployeeAttendance() {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    // Filter states
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    employeeId: 'all',
    status: 'all',
  });
  // Form states
  const [formData, setFormData] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    check_in_time: '',
    check_out_time: '',
    status: 'present' as 'present' | 'absent' | 'late' | 'half_day' | 'late_present' | 'not_marked' | 'late_without_notice' | 'leave_without_notice',
    notes: '',
  });

  // Summary statistics
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
        const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId && filters.employeeId !== 'all') params.append('employeeId', filters.employeeId);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      
      const data = await attendanceApi.getAllAttendance(params.toString());
      setAttendance(data.attendance || []);
      
      // Fetch summary
      const summaryData = await attendanceApi.getAttendanceSummary(params.toString());
      setSummary({
        totalEmployees: summaryData.totalEmployees || 0,
        presentToday: summaryData.statusSummary?.find((s: any) => s.status === 'present')?.count || 0,
        absentToday: summaryData.statusSummary?.find((s: any) => s.status === 'absent')?.count || 0,
        lateToday: summaryData.statusSummary?.find((s: any) => s.status === 'late')?.count || 0,
      });
      
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const data = await attendanceApi.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Handle add attendance
  const handleAddAttendance = async () => {
    try {
      await attendanceApi.createAttendance(formData);
      toast({
        title: 'Success',
        description: 'Attendance record created successfully',
      });
      setIsAddDialogOpen(false);
      setFormData({
        employee_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        check_in_time: '',
        check_out_time: '',
        status: 'present',
        notes: '',
      });
      fetchAttendance();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create attendance record',
        variant: 'destructive',
      });
    }
  };

  // Handle edit attendance
  const handleEditAttendance = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      employee_id: record.employee_id,
      date: record.date,
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
      status: record.status,
      notes: record.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  // Handle update attendance
  const handleUpdateAttendance = async () => {
    if (!selectedRecord) return;

    try {
      await attendanceApi.updateAttendance(selectedRecord.id, {
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time,
        status: formData.status,
        notes: formData.notes,
      });
      toast({
        title: 'Success',
        description: 'Attendance record updated successfully',
      });
      setIsEditDialogOpen(false);
      fetchAttendance();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update attendance record',
        variant: 'destructive',
      });
    }
  };

  // Handle delete attendance
  const handleDeleteAttendance = async (record: AttendanceRecord) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      await attendanceApi.deleteAttendance(record.id);
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
      });
      fetchAttendance();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete attendance record',
        variant: 'destructive',
      });
    }
  };

  // Create columns
  const columns = useMemo(() => 
    createAttendanceColumns(fetchAttendance, handleEditAttendance, handleDeleteAttendance), 
    []
  );

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  if (loading && attendance.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );  }

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <div className="flex-none space-y-4 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Employee Attendance</h1>
            <p className="text-muted-foreground">
              Track and manage employee attendance records
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => window.location.href = '/employee-attendance/bulk'}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              {/* <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Individual Record
                </Button>
              </DialogTrigger> */}
              <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">Employee</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} ({emp.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="checkin" className="text-right">Check In</Label>
                  <Input
                    id="checkin"
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_in_time: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="checkout" className="text-right">Check Out</Label>
                  <Input
                    id="checkout"
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_out_time: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Optional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAttendance}>
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

              
        

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div> 
      {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Active employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.presentToday}</div>
              <p className="text-xs text-muted-foreground">
                Employees present
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.absentToday}</div>
              <p className="text-xs text-muted-foreground">
                Employees absent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Today</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.lateToday}</div>
              <p className="text-xs text-muted-foreground">
                Late arrivals
              </p>
            </CardContent>
          </Card>
        </div>
          {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full"
                />
              </div>              <div className="space-y-2">
                <Label htmlFor="employeeFilter" className="text-sm font-medium">Employee</Label>
                <Select
                  value={filters.employeeId}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, employeeId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusFilter" className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
           {/* Data Table */}
      <div className="flex-1 px-6 pb-6 min-h-0 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardContent className="p-6 flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-auto">
              <DataTable
                columns={columns}
                data={attendance}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCheckin" className="text-right">Check In</Label>
              <Input
                id="editCheckin"
                type="time"
                value={formData.check_in_time}
                onChange={(e) => setFormData(prev => ({ ...prev, check_in_time: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCheckout" className="text-right">Check Out</Label>
              <Input
                id="editCheckout"
                type="time"
                value={formData.check_out_time}
                onChange={(e) => setFormData(prev => ({ ...prev, check_out_time: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editStatus" className="text-right">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editNotes" className="text-right">Notes</Label>
              <Input
                id="editNotes"
                placeholder="Optional notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAttendance}>
              Update            </Button>
          </div>        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
