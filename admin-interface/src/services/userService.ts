import axios from 'axios';
import { User, UserStatus, MembershipLevel, UserRole } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * User request data for creating or updating a user
 */
export interface UserRequest {
  id?: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  membershipLevel: MembershipLevel;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
}

/**
 * User response data returned from the API
 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  membershipLevel: MembershipLevel;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
}

/**
 * Search criteria for filtering users
 */
export interface UserCriteria {
  username?: string;
  email?: string;
  fullName?: string;
  status?: UserStatus;
  role?: UserRole;
}

/**
 * User profile data structure
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullname: string;
  phone?: string;
  dob?: string;
  avatarUrl?: string;
  membershipLevel: string;
}

/**
 * Data structure for updating a user's profile
 */
export interface UpdateProfileRequest {
  fullname: string;
  email: string;
  phone?: string;
  dob?: string;
  avatarFile?: File | null;
}

/**
 * Data structure for changing a user's password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  getAllUsers: async (criteria?: UserCriteria, page = 0, size = 20) => {
    const response = await axios.get(`${API_URL}/user`, {
      params: {
        ...criteria,
        page,
        size,
        sort: 'id,desc'
      }
    });
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await axios.get(`${API_URL}/user/${id}`);
    return response.data;
  },

  createUser: async (userData: UserRequest, avatarFile?: File) => {
    const formData = new FormData();
    formData.append('userRequestData', new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    }));
    if (avatarFile) {
      formData.append('avatarUrl', avatarFile);
    }

    const response = await axios.post(`${API_URL}/user`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateUser: async (userData: UserRequest, avatarFile?: File) => {
    const formData = new FormData();
    formData.append('userRequestData', new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    }));
    if (avatarFile) {
      formData.append('avatarUrl', avatarFile);
    }

    const response = await axios.put(`${API_URL}/user`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  activateUser: async (id: number) => {
    const response = await axios.put(`${API_URL}/user/${id}`);
    return response.data;
  },

  deactivateUser: async (id: number) => {
    const response = await axios.delete(`${API_URL}/user/${id}`);
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await axios.post(`${API_URL}/user/resetPassword`, { email });
    return response.data;
  },

  exportUsers: async (criteria?: UserCriteria) => {
    const response = await axios.get(`${API_URL}/user/export`, {
      params: criteria,
      responseType: 'blob'
    });
    return response.data;
  },

  fetchUserProfile: async (): Promise<UserProfile> => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  },

  updateUserProfile: async (userData: UpdateProfileRequest): Promise<UserProfile> => {
    try {
      const formData = new FormData();
      
      // Add user data as JSON
      const userDataBlob = new Blob([JSON.stringify({
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone || '',
        dob: userData.dob || '',
      })], {
        type: 'application/json'
      });
      
      formData.append('userRequestData', userDataBlob);
      
      // Add avatar if exists
      if (userData.avatarFile) {
        formData.append('avatarUrl', userData.avatarFile);
      }
      
      const response = await axios.put(`${API_URL}/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  },

  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    try {
      await axios.post(`${API_URL}/user/change-password`, passwordData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }
}; 