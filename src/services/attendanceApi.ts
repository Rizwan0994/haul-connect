import apiClient from '../lib/api-client';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'late_present' | 'not_marked' | 'late_without_notice' | 'leave_without_notice';
  notes?: string;
  employee: {
    id: string;
    username: string;
    email: string;
    role: string;
    department?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreateRequest {
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'late_present' | 'not_marked' | 'late_without_notice' | 'leave_without_notice';
  notes?: string;
}

export interface AttendanceUpdateRequest {
  check_in_time?: string;
  check_out_time?: string;
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'late_present' | 'not_marked' | 'late_without_notice' | 'leave_without_notice';
  notes?: string;
}

export interface AttendanceApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const attendanceApi = {
  // Get all attendance records with optional query params
  getAllAttendance: async (queryParams?: string): Promise<{ attendance: AttendanceRecord[], pagination: any }> => {
    try {
      const url = queryParams ? `/attendance?${queryParams}` : '/attendance';
      const response = await apiClient.get<AttendanceApiResponse<{ attendance: AttendanceRecord[], pagination: any }>>(url);
      return response.data.data || { attendance: [], pagination: {} };
    } catch (error: any) {
      console.error('Error fetching attendance records:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance records');
    }
  },

  // Get attendance by ID
  getAttendanceById: async (id: string): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.get<AttendanceApiResponse<AttendanceRecord>>(`/attendance/${id}`);
      if (!response.data.data) {
        throw new Error('Attendance record not found');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching attendance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance record');
    }
  },

  // Create attendance record
  createAttendance: async (data: AttendanceCreateRequest): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post<AttendanceApiResponse<AttendanceRecord>>('/attendance', data);
      if (!response.data.data) {
        throw new Error('Failed to create attendance record');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating attendance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to create attendance record');
    }
  },

  // Update attendance record
  updateAttendance: async (id: string, data: AttendanceUpdateRequest): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.put<AttendanceApiResponse<AttendanceRecord>>(`/attendance/${id}`, data);
      if (!response.data.data) {
        throw new Error('Failed to update attendance record');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating attendance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to update attendance record');
    }
  },

  // Delete attendance record
  deleteAttendance: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<AttendanceApiResponse<void>>(`/attendance/${id}`);
    } catch (error: any) {
      console.error('Error deleting attendance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete attendance record');
    }
  },

  // Get attendance summary/analytics
  getAttendanceSummary: async (queryParams?: string): Promise<any> => {
    try {
      const url = queryParams ? `/attendance/summary?${queryParams}` : '/attendance/summary';
      const response = await apiClient.get<AttendanceApiResponse<any>>(url);
      return response.data.data || {};
    } catch (error: any) {
      console.error('Error fetching attendance summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance summary');
    }
  },
  // Get employees list for dropdown
  getEmployees: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<AttendanceApiResponse<any[]>>('/users');
      console.log('Fetched employees:', response);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
  },

  // Get employees for bulk attendance marking (with their current attendance status for a date)
  getEmployeesForBulkAttendance: async (date: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<AttendanceApiResponse<any[]>>(`/attendance/employees-for-date?date=${date}`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching employees for bulk attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employees for bulk attendance');
    }
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (date: string, attendanceData: AttendanceCreateRequest[]): Promise<any> => {
    try {
      const response = await apiClient.post<AttendanceApiResponse<any>>('/attendance/bulk', {
        date,
        attendanceData
      });
      return response.data.data || {};
    } catch (error: any) {
      console.error('Error in bulk attendance marking:', error);
      throw new Error(error.response?.data?.message || 'Failed to process bulk attendance marking');
    }
  },

  // Generate attendance report
  generateAttendanceReport: async (startDate: string, endDate: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/attendance/report?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating attendance report:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate attendance report');
    }
  }
};
