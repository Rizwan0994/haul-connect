// Helper functions for user management
import { roleAPI } from './permission-api';

// Fetch available roles for user creation/edit forms
export const fetchAvailableRoles = async () => {
  try {
    const roles = await roleAPI.getAllRoles();
    return roles.map(role => ({
      value: role.id.toString(), 
      label: role.name
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
};
