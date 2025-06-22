// components/tabs/RoomAllotmentTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Key, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  MapPin, 
  Users, 
  Home,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useRoomAllotment, HotelRoom } from '../../hooks/useRoomAllotment';
import RoomAllotmentModal from '../modals/RoomAllotmentModal';

const RoomAllotmentTab: React.FC = () => {
  const { fetchAllRooms, rooms, loading, error } = useRoomAllotment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'vacant'>('all');
  const [sortBy, setSortBy] = useState<'roomNumber' | 'userName'>('roomNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchAllRooms();
  }, [fetchAllRooms]);

  // Filter and sort rooms
  const filteredAndSortedRooms = rooms
    .filter(room => {
      const matchesSearch = 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.user?.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'occupied' && room.user) ||
        (filterStatus === 'vacant' && !room.user);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'roomNumber') {
        comparison = a.roomNumber.localeCompare(b.roomNumber);
      } else if (sortBy === 'userName') {
        const aName = a.user?.name || '';
        const bName = b.user?.name || '';
        comparison = aName.localeCompare(bName);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const occupiedRooms = rooms.filter(room => room.user);
  const vacantRooms = rooms.filter(room => !room.user);

  const handleRefresh = () => {
    fetchAllRooms();
  };

  const handleModalSuccess = () => {
    fetchAllRooms();
  };

  const getStatusColor = (room: HotelRoom) => {
    return room.user ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (room: HotelRoom) => {
    return room.user ? CheckCircle : X;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span>Hotel Room Allotment</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Manage hotel room assignments for all users
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          <span>Assign Room</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-green-600">{occupiedRooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vacant</p>
              <p className="text-2xl font-bold text-gray-600">{vacantRooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by room number, user name, email, or employee code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Rooms</option>
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="roomNumber">Sort by Room</option>
              <option value="userName">Sort by User</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : filteredAndSortedRooms.length > 0 ? (
          filteredAndSortedRooms.map((room) => {
            const StatusIcon = getStatusIcon(room);
            return (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Room Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Room {room.roomNumber}</h3>
                      <p className="text-sm text-gray-500">ID: {room.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(room)}`}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{room.user ? 'Occupied' : 'Vacant'}</span>
                  </span>
                </div>

                {/* User Info */}
                {room.user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {room.user.profileImage ? (
                        <img
                          src={room.user.profileImage}
                          alt={room.user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{room.user.name}</p>
                        <p className="text-sm text-gray-500">{room.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Employee Code:</span>
                        <span className="font-medium">{room.user.employeeCode || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{room.user.department || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No user assigned</p>
                    <p className="text-gray-400 text-xs">Click "Assign Room" to assign a user</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    {room.user ? 'Reassign Room' : 'Assign User'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by assigning rooms to users'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Assign First Room</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Room Allotment Modal */}
      <RoomAllotmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default RoomAllotmentTab; 