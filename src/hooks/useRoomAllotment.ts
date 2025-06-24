import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export interface HotelRoom {
  id: string;
  roomNumber: string;
  user?: {
    id: string;
    name: string;
    email: string;
    employeeCode?: string;
    department?: string;
    profileImage?: string;
  } | null;
  users?: {
    id: string;
    name: string;
    email: string;
    employeeCode?: string;
    department?: string;
    profileImage?: string;
  }[];
}

export interface AssignRoomRequest {
  roomNumber: string;
}

export interface RoomAllotmentResponse {
  success: boolean;
  message: string;
  data: HotelRoom;
}

export interface RoomsListResponse {
  success: boolean;
  data: HotelRoom[];
}

export interface UserRoomResponse {
  success: boolean;
  data: HotelRoom | null;
}

export const useRoomAllotment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);

  // Assign room to user
  const assignRoomToUser = useCallback(async (userId: string, roomNumber: string): Promise<HotelRoom | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Assigning room', roomNumber, 'to user', userId);
      const response = await apiService.assignRoomToUser(userId, roomNumber);
      
      console.log('Assign room response:', response);
      
      if (response.success) {
        // Refresh rooms list after assignment
        await fetchAllRooms();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to assign room');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign room';
      setError(errorMessage);
      console.error('Assign room error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all rooms with assigned users
  const fetchAllRooms = useCallback(async (): Promise<HotelRoom[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all rooms...');
      const response = await apiService.getAllRooms();
      console.log('Rooms response:', response);
      
      if (response.success) {
        // Transform the API response to match the expected structure
        const transformedRooms: HotelRoom[] = response.data.map((room: any) => ({
          id: room.id,
          roomNumber: room.roomNumber,
          user: room.users && room.users.length > 0 ? room.users[0] : null, // Take the first user for backward compatibility
          users: room.users || [] // Keep the users array for future use
        }));
        
        console.log('Transformed rooms:', transformedRooms);
        setRooms(transformedRooms);
        return transformedRooms;
      } else {
        throw new Error('Failed to fetch rooms');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch rooms';
      setError(errorMessage);
      console.error('Rooms fetch error:', err);
      
      // For development, provide mock data if API is not available
      if (process.env.NODE_ENV === 'development' && err.response?.status === 403) {
        const mockRooms: HotelRoom[] = [
          {
            id: 'room-1',
            roomNumber: 'A101',
            user: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john.doe@company.com',
              employeeCode: 'EMP001',
              department: 'Engineering',
              profileImage: '/uploads/profiles/default.jpg'
            }
          },
          {
            id: 'room-2',
            roomNumber: 'A102',
            user: null
          },
          {
            id: 'room-3',
            roomNumber: 'B201',
            user: {
              id: 'user-2',
              name: 'Jane Smith',
              email: 'jane.smith@company.com',
              employeeCode: 'EMP002',
              department: 'Management',
              profileImage: '/uploads/profiles/default.jpg'
            }
          }
        ];
        
        setRooms(mockRooms);
        return mockRooms;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get room for a specific user
  const getUserRoom = useCallback(async (userId: string): Promise<HotelRoom | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching room for user:', userId);
      const response = await apiService.getUserRoom(userId);
      console.log('User room response:', response);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch user room');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user room';
      setError(errorMessage);
      console.error('User room fetch error:', err);
      
      // For development, provide mock data if API is not available
      if (process.env.NODE_ENV === 'development' && err.response?.status === 403) {
        // Return null for user room in development mode
        return null;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    rooms,
    assignRoomToUser,
    fetchAllRooms,
    getUserRoom,
    clearError,
  };
}; 