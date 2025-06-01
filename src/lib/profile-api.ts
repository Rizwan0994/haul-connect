import apiClient from './api-client';

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  sudoName?: string;
  fatherName?: string;
  address?: string;
  contact?: string;
  cnic?: string;
  experience?: string;
  photo?: File;
}

// Type alias for backward compatibility
export type UpdateProfileRequest = ProfileUpdateData;

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DocumentInfo {
  id: number;
  documentName: string;
  filePath: string;
  uploadedAt: string;
}

// Type alias for backward compatibility
export type Document = DocumentInfo;

export const profileApi = {
  async getProfile() {
    const response = await apiClient.get("/api/profile");
    return response.data;
  },
  async updateProfile(data: ProfileUpdateData, photo?: File) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'photo') {
        formData.append(key, value);
      }
    });

    // Handle photo parameter (either from data.photo or separate photo parameter)
    const photoFile = photo || data.photo;
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    const response = await apiClient.put("/api/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updatePassword(data: PasswordUpdateData) {
    const response = await apiClient.put("/api/profile/password", data);
    return response.data;
  },

  async getDocuments() {
    const response = await apiClient.get("/api/profile/documents");
    return response.data;
  },

  async uploadDocument(file: File, documentName: string) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentName", documentName);

    const response = await apiClient.post("/api/profile/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteDocument(documentId: number) {
    const response = await apiClient.delete(
      `/api/profile/documents/${documentId}`
    );
    return response.data;
  },
};
