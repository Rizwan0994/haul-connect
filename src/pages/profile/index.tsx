"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/auth-context";
import { UserCircle, Upload, X, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  profileApi,
  type UpdateProfileRequest,
  type PasswordUpdateData,
  type DocumentInfo,
} from "@/lib/profile-api";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);

  // Profile states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    sudoName: "",
    fatherName: "",
    address: "",
    contact: "",
    cnic: "",
    experience: "",
    department: "",
    onboardDate: "",
    lastLogin: "",
    lastLoginIp: "",
    photoUrl: "",
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // Load profile data on mount
  useEffect(() => {
    // First try to auto-fill from currentUser context
    if (currentUser) {
      setPersonalInfo({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        sudoName: currentUser.username || "",
        fatherName: currentUser.fatherName || "",
        address: currentUser.address || "",
        contact: currentUser.contact || "",
        cnic: currentUser.cnic || "",
        experience: currentUser.experience || "",
        department: currentUser.department || "",
        onboardDate: currentUser.onboardDate || "",
        lastLogin: currentUser.lastLogin || "",
        lastLoginIp: currentUser.lastLoginIp || "",
        photoUrl: currentUser.photoUrl || "",
      });
      
      if (currentUser.photoUrl) {
        setImagePreview(`${import.meta.env.VITE_API_URL}${currentUser.photoUrl}`);
      }
    }
    
    // Then load fresh data from API
    loadProfileData();
    loadDocuments();
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await profileApi.getProfile();
      if (response.success && response.user) {
        setPersonalInfo({
          firstName: response.user.firstName || "",
          lastName: response.user.lastName || "",
          sudoName: response.user.sudoName || "",
          fatherName: response.user.fatherName || "",
          address: response.user.address || "",
          contact: response.user.contact || "",
          cnic: response.user.cnic || "",
          experience: response.user.experience || "",
          department: response.user.department || "",
          onboardDate: response.user.onboardDate || "",
          lastLogin: response.user.lastLogin || "",
          lastLoginIp: response.user.lastLoginIp || "",
          photoUrl: response.user.photoUrl || "",
        });
        
        if (response.user.photoUrl) {
          setImagePreview(`${import.meta.env.VITE_API_URL}${response.user.photoUrl}`);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await profileApi.getDocuments();
      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast.error("Failed to load documents");
    }
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedDocument(file);
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      
      const updateData: UpdateProfileRequest = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        sudoName: personalInfo.sudoName,
        fatherName: personalInfo.fatherName,
        address: personalInfo.address,
        contact: personalInfo.contact,
        cnic: personalInfo.cnic,
        experience: personalInfo.experience,
      };

      const response = await profileApi.updateProfile(updateData, selectedPhoto || undefined);
      
      if (response.success) {
        toast.success("Profile updated successfully");
        setSelectedPhoto(null);
        await loadProfileData(); // Reload to get updated data
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await profileApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      
      if (response.success) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedDocument) {
      toast.error("Please select a document to upload");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please provide a name for the document");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await profileApi.uploadDocument(selectedDocument, documentName);
      
      if (response.success) {
        toast.success("Document uploaded successfully");
        setSelectedDocument(null);
        setDocumentName("");
        await loadDocuments(); // Reload documents
      } else {
        toast.error(response.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await profileApi.deleteDocument(documentId);
      
      if (response.success) {
        toast.success("Document deleted successfully");
        await loadDocuments(); // Reload documents
      } else {
        toast.error(response.message || "Failed to delete document");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Update your profile information and manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Photo Section */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-20 h-20 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Label
                    htmlFor="photo"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md cursor-pointer"
                  >
                    Upload Photo
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-gray-500">
                    JPG, GIF or PNG. Max size of 2MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>              <CardContent className="space-y-4">                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email address cannot be changed. Contact HR for email updates.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sudoName">Sudo Name</Label>
                    <Input
                      id="sudoName"
                      value={personalInfo.sudoName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, sudoName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      value={personalInfo.fatherName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, fatherName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input
                      id="cnic"
                      value={personalInfo.cnic}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, cnic: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact #</Label>
                    <Input
                      id="contact"
                      value={personalInfo.contact}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={personalInfo.department}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={personalInfo.address}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      value={personalInfo.experience}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, experience: e.target.value })
                      }
                    />
                  </div>                  <div className="space-y-2">
                    <Label>Onboard Date</Label>
                    <Input
                      value={personalInfo.onboardDate ? format(new Date(personalInfo.onboardDate), "PPP") : "N/A"}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Login Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                    <div className="space-y-2">
                      <Label>Last Login</Label>
                      <Input
                        value={personalInfo.lastLogin ? format(new Date(personalInfo.lastLogin), "PPP HH:mm:ss") : "N/A"}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Login IP</Label>
                      <Input
                        value={personalInfo.lastLoginIp}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" disabled={isLoading}>Cancel</Button>
                  <Button onClick={handleProfileUpdate} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload Card */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-lg">Upload Additional Document</CardTitle>
                <CardDescription>
                  You can upload any other document (PDF, DOC, images, etc.) related to your profile.
                </CardDescription>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      type="text"
                      placeholder="Document name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="max-w-xs"
                      onChange={handleDocumentChange}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleDocumentUpload}
                      disabled={isLoading || !selectedDocument}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isLoading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  
                  {/* Documents List */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{doc.documentName}</span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(doc.uploadedAt), "PPP")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}${doc.filePath}`, '_blank')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDocumentDelete(doc.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" disabled={isLoading}>Cancel</Button>
                  <Button onClick={handlePasswordUpdate} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
