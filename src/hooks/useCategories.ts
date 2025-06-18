// hooks/useCategories.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface CategoryUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeCode?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  users: CategoryUser[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeCode?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface AssignUserRequest {
  categoryId: string;
  userId: string;
}

export interface CategoriesResponse {
  data?: Category[];
  success?: boolean;
}

export interface CategoryResponse {
  data?: Category;
  success?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useCategories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Create a new category
  const createCategory = useCallback(async (categoryData: CreateCategoryRequest): Promise<Category | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Category>('/categories', categoryData);
      
      // API returns category directly, not wrapped in success/data
      if (response.data && response.data.id) {
        // Refresh categories list after creation
        await fetchCategories();
        return response.data;
      } else {
        throw new Error('Failed to create category');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all categories
  const fetchCategories = useCallback(async (): Promise<Category[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Category[]>('/categories');
      
      // API returns categories array directly
      if (Array.isArray(response.data)) {
        setCategories(response.data);
        return response.data;
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Categories fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch category by ID
  const fetchCategoryById = useCallback(async (categoryId: string): Promise<Category | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Category>(`/categories/${categoryId}`);
      
      // API returns category directly
      if (response.data && response.data.id) {
        return response.data;
      } else {
        throw new Error('Failed to fetch category');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch category';
      setError(errorMessage);
      console.error('Category fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users available for category assignment
  const fetchUsers = useCallback(async (): Promise<User[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Assuming the users endpoint is similar to teams
      const response = await api.get<UsersResponse>('/categories/users');
      
      if (response.data.success) {
        setUsers(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Users fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign user to category
  const assignUserToCategory = useCallback(async (categoryId: string, userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/categories/${categoryId}/users/${userId}`);
      
      if (response.status === 200 || response.status === 201) {
        // Refresh categories and users list after assignment
        await Promise.all([fetchCategories(), fetchUsers()]);
        return true;
      } else {
        throw new Error('Failed to assign user to category');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to assign user to category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchUsers]);

  // Remove user from category
  const removeUserFromCategory = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/categories/users/${userId}`);
      
      if (response.status === 200 || response.status === 204) {
        // Refresh categories and users list after removal
        await Promise.all([fetchCategories(), fetchUsers()]);
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove user from category';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchUsers]);

  // Update category details
  const updateCategory = useCallback(async (categoryId: string, categoryData: Partial<CreateCategoryRequest>): Promise<Category | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<Category>(`/categories/${categoryId}`, categoryData);
      
      // API returns updated category directly
      if (response.data && response.data.id) {
        // Refresh categories list after update
        await fetchCategories();
        return response.data;
      } else {
        throw new Error('Failed to update category');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      
      if (response.status === 200 || response.status === 204) {
        // Refresh categories list after deletion
        await fetchCategories();
        return true;
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Get category statistics
  const getCategoryStats = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;

    return {
      userCount: category.users.length,
      departments: [...new Set(category.users.map(u => u.department).filter(Boolean))],
      roles: [...new Set(category.users.map(u => u.role))],
    };
  }, [categories]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    categories,
    users,
    createCategory,
    fetchCategories,
    fetchCategoryById,
    fetchUsers,
    assignUserToCategory,
    removeUserFromCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
    clearError,
  };
};