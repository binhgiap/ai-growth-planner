import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse, PaginatedResponse, logApiCall } from './config';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  targetRole: string;
  skills?: string[];
  targetSkills?: string[];
  hoursPerWeek?: number;
  bio?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  currentRole?: string;
  targetRole?: string;
  skills?: string[];
  targetSkills?: string[];
  hoursPerWeek?: number;
  bio?: string;
}

export interface UserNFT {
  tokenId: string;
  contractAddress: string;
  txHash: string;
  description: string;
  userInfo: string;
  mintedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  targetRole: string;
  skills?: string[];
  targetSkills?: string[];
  hoursPerWeek?: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  nfts?: UserNFT[];
}

export const usersApi = {
  // Create a new user
  create: async (data: CreateUserDto): Promise<ApiResponse<User>> => {
    const url = `${API_BASE_URL}/api/users`;
    logApiCall('POST', url, data);
    console.log(`[API] Making request to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<User>>(response, 'POST', url);
  },

  // Get all users with pagination
  findAll: async (params?: { limit?: number; page?: number }): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `${API_BASE_URL}/api/users?${queryParams}`;
    logApiCall('GET', url);
    console.log(`[API] Making request to: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<PaginatedResponse<User>>(response, 'GET', url);
  },

  // Get user by ID
  findById: async (id: string): Promise<ApiResponse<User>> => {
    const url = `${API_BASE_URL}/api/users/${id}`;
    logApiCall('GET', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<User>>(response, 'GET', url);
  },

  // Get user profile with related data
  getProfile: async (id: string): Promise<ApiResponse<User>> => {
    const url = `${API_BASE_URL}/api/users/profile/${id}`;
    logApiCall('GET', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<User>>(response, 'GET', url);
  },

  // Update user
  update: async (id: string, data: UpdateUserDto): Promise<ApiResponse<User>> => {
    const url = `${API_BASE_URL}/api/users/${id}`;
    logApiCall('PATCH', url, data);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<User>>(response, 'PATCH', url);
  },

  // Delete user (soft delete)
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },
};

