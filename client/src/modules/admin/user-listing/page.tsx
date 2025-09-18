import { CHANGE_STATUS } from '@/graphql/queries/user';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Mail,
  Phone,
  Calendar,
  Users as UsersIcon,
  Eye
} from 'lucide-react';

// Types and Interfaces
import { User } from '@/interfaces/admin.interface';
import { UserListingProps } from '@/interfaces/admin.interface';
import { apiRequest } from '@/api';

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
  },
  {
    id: '3',
    fullName: 'Mike Johnson',
    email: 'mike.johnson@example.com',
  },
  {
    id: '4',
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
  },
  {
    id: '5',
    fullName: 'David Brown',
    email: 'david.brown@example.com',
  },
  {
    id: '6',
    fullName: 'Emily Davis',
    email: 'emily.davis@example.com',
  }
];

// UserListing Component
const UserListing: React.FC<UserListingProps> = ({ users = sampleUsers }) => {
  console.log('users data in the component: ', users)

  const [userList, setUserList] = useState<User[]>(users);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

   useEffect(() => {
    setUserList(users);
  }, [users]);

    // Safe helper functions
    const getAvatarInitials = (name?: string): string => {
      if (!name) return "-";
      return name.split(" ").map(word => word[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString?: string): string => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? "-" 
        : date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
    };

    // Filter users
    const filteredUsers = userList.filter(user => {
      const matchesSearch =
        (user?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user?.phone || "").includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || user?.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user?.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

  const toggleUserStatus = async (userId: string): Promise<void> => {

  const user = userList.find(u => u.id === userId);
  if (!user) return;

  const prevStatus = user.status;
  const newStatus = prevStatus === "active" ? "blocked" : "active";
  const status = newStatus === "blocked" ? true : "active";

  const SEND_QUERY = {
    query: CHANGE_STATUS.query,
    variables: {
      input: {
        userId: userId,
        status: status,
      },
    },
  };

    try {
      const response = await apiRequest(SEND_QUERY);
      console.log("data after changing the status: ", response);

      setUserList(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }

    setDropdownOpen(null);
  };



  // Delete user
  const deleteUser = (userId: string): void => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUserList(prevUsers => prevUsers.filter(user => user.id !== userId));
    }
    setDropdownOpen(null);
  };

  // Unique roles for filter
  const uniqueRoles = Array.from(new Set(users.map(user => user.role || "-")));

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and monitor all registered users
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {userList.length} users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: User) => (
                <tr key={user.id || Math.random()} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user?.avatar ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user?.fullName || "-"} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {getAvatarInitials(user?.fullName)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user?.fullName || "-"}</div>
                        <div className="text-sm text-gray-500">ID: {user?.id || "-"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail size={14} className="text-gray-400 mr-2" />
                        {user?.email || "-"}
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="text-gray-400 mr-2" />
                        {user?.phone || "-"}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user?.role === 'Moderator'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.role || "-"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user?.status === 'blocked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.status ? (user.status === 'active' ? 'Active' : 'Blocked') : "-"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar size={14} className="text-gray-400 mr-2" />
                      {formatDate(user?.joinDate)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user?.lastLogin)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === user?.id ? null : user?.id || null)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {dropdownOpen === user?.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {/* Handle view */}}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye size={14} className="mr-2" />
                              View Details
                            </button>

                            <button
                              onClick={() => {/* Handle edit */}}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit size={14} className="mr-2" />
                              Edit User
                            </button>

                            <button
                              onClick={() => toggleUserStatus(user?.id || '')}
                              className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                                user?.status === 'active'
                                  ? 'text-red-700 hover:bg-red-50'
                                  : 'text-green-700 hover:bg-green-50'
                              }`}
                            >
                              {user?.status === 'active' ? (
                                <>
                                  <ShieldOff size={14} className="mr-2" />
                                  Block User
                                </>
                              ) : (
                                <>
                                  <Shield size={14} className="mr-2" />
                                  Unblock User
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => deleteUser(user?.id || '')}
                              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <UsersIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setDropdownOpen(null)}
        ></div>
      )}
    </div>
  );
};

export default UserListing;
