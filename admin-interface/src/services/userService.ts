import axios from 'axios';
import { User, UserStatus, MembershipLevel, UserRole } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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

export interface UserCriteria {
  username?: string;
  email?: string;
  fullName?: string;
  status?: UserStatus;
  role?: UserRole;
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
  }
}; 