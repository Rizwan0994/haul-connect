import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Check, X, Clock, Users, FileDown, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceApi } from '../../services/attendanceApi';

interface AttendanceCreateRequest {
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'late_present' | 'not_marked' | 'late_without_notice' | 'leave_without_notice';
  notes?: string;
}

// Define status options with their display labels and colors
const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'not_marked', label: 'Not Marked', color: 'bg-gray-100 text-gray-800' },
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800' },
  { value: 'late_present', label: 'Late Present', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'late_without_notice', label: 'Late Without Notice', color: 'bg-orange-100 text-orange-800' },
  { value: 'leave_without_notice', label: 'Leave Without Notice', color: 'bg-purple-100 text-purple-800' },
  { value: 'half_day', label: 'Half Day', color: 'bg-blue-100 text-blue-800' },
];

interface Employee {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: string;
  currentAttendance?: {
    id: string;
    status: string;
    check_in_time?: string;
    check_out_time?: string;
    notes?: string;
  };
}

export default function BulkAttendance() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  // Fetch employees for the selected date
  const fetchEmployeesForDate = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getEmployeesForBulkAttendance(selectedDate);
      setEmployees(data);
      
      // Initialize attendance data with current status
      const initialData: Record<string, string> = {};
      data.forEach((emp: Employee) => {
        initialData[emp.id] = emp.currentAttendance?.status || 'not_marked';
      });
      setAttendanceData(initialData);
      
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesForDate();
  }, [selectedDate]);

  // Handle status change for an employee
  const handleStatusChange = (employeeId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  // Bulk actions
  const markAllPresent = () => {
    const updatedData: Record<string, string> = {};
    employees.forEach(emp => {
      updatedData[emp.id] = 'present';
    });
    setAttendanceData(updatedData);
  };

  const markAllAbsent = () => {
    const updatedData: Record<string, string> = {};
    employees.forEach(emp => {
      updatedData[emp.id] = 'absent';
    });
    setAttendanceData(updatedData);
  };

  const clearAll = () => {
    const updatedData: Record<string, string> = {};
    employees.forEach(emp => {
      updatedData[emp.id] = 'not_marked';
    });
    setAttendanceData(updatedData);
  };

  // Save attendance
  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceRequests: AttendanceCreateRequest[] = Object.entries(attendanceData)
        .filter(([_, status]) => status !== 'not_marked')
        .map(([employeeId, status]) => ({
          employee_id: employeeId,
          date: selectedDate,
          status: status as any,
        }));

      await attendanceApi.bulkMarkAttendance(selectedDate, attendanceRequests);
      
      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });
      
      // Refresh data
      fetchEmployeesForDate();
      
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance data',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate report
  const generateReport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await attendanceApi.generateAttendanceReport(selectedDate, selectedDate, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${selectedDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: `Report downloaded successfully`,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  // Get status option by value
  const getStatusOption = (value: string) => {
    return ATTENDANCE_STATUS_OPTIONS.find(option => option.value === value) || ATTENDANCE_STATUS_OPTIONS[0];
  };

  // Calculate summary stats
  const summary = {
    total: employees.length,
    present: Object.values(attendanceData).filter(status => status === 'present').length,
    absent: Object.values(attendanceData).filter(status => status === 'absent').length,
    late: Object.values(attendanceData).filter(status => status.includes('late')).length,
    notMarked: Object.values(attendanceData).filter(status => status === 'not_marked').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            📝 Mark Attendance
          </h1>
          <p className="text-gray-600 mt-1">
            Select date and mark attendance for all employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateReport('pdf')}
            variant="outline"
            size="sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
          <Button
            onClick={() => generateReport('excel')}
            variant="outline"
            size="sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Excel Report
          </Button>
        </div>
      </div>

      {/* Date Selection and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Select Date:</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Total: <span className="font-semibold">{summary.total}</span></div>
              <div>Present: <span className="font-semibold text-green-600">{summary.present}</span></div>
              <div>Absent: <span className="font-semibold text-red-600">{summary.absent}</span></div>
              <div>Late: <span className="font-semibold text-yellow-600">{summary.late}</span></div>
              <div>Not Marked: <span className="font-semibold text-gray-600">{summary.notMarked}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="font-semibold">Quick Actions:</Label>
            <Button
              onClick={markAllPresent}
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-700"
            >
              ✅ Mark All Present
            </Button>
            <Button
              onClick={markAllAbsent}
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-700"
            >
              ❌ Mark All Absent
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              🔄 Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Attendance Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const currentStatus = attendanceData[employee.id] || 'not_marked';
                  const statusOption = getStatusOption(currentStatus);
                  
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.id}</TableCell>
                      <TableCell>{employee.username}</TableCell>
                      <TableCell>{employee.department || employee.role}</TableCell>
                      <TableCell>
                        <Select
                          value={currentStatus}
                          onValueChange={(value) => handleStatusChange(employee.id, value)}
                        >
                          <SelectTrigger className="w-48">
                            <div className="flex items-center gap-2">
                              <Badge className={statusOption.color}>
                                {statusOption.label}
                              </Badge>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={option.color}>
                                    {option.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {employee.currentAttendance?.check_in_time && (
                          <div className="text-xs text-gray-500 mt-1">
                            Late arrival at {employee.currentAttendance.check_in_time} on{' '}
                            {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveAttendance}
          disabled={saving}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  );
}
