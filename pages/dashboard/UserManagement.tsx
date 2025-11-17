import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import Card from '../../components/ui/Card';
import Switch from '../../components/ui/Switch';
import Modal from '../../components/ui/Modal';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface UserManagementProps {
    user: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ user: currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<{ success: true; data: User[] }>('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusOrRoleChange = async (userId: string, updateData: Partial<User>) => {
    // Optimistic UI update
    const originalUsers = [...users];
    setUsers(users.map(user => user.id === userId ? { ...user, ...updateData } : user));

    try {
      // Fix: Pass the body as a plain object. The `apiClient` handles stringification.
      await apiClient(`/users/${userId}`, {
        method: 'PUT',
        body: updateData,
      });
    } catch (err) {
      // Revert on failure
      setUsers(originalUsers);
      alert('Failed to update user.');
    }
  };
  
  const handleOpenModal = (user: User | null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingUser(null);
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
        if (editingUser) { // Update
            // Fix: Pass the body as a plain object. The `apiClient` handles stringification.
            await apiClient(`/users/${editingUser.id}`, {
                method: 'PUT',
                body: userData
            });
        } else { // Create
            // Fix: Pass the body as a plain object. The `apiClient` handles stringification.
            await apiClient('/users', {
                method: 'POST',
                body: userData
            });
        }
        handleCloseModal();
        fetchUsers(); // Refresh data
    } catch (err: any) {
        alert(`Error saving user: ${err.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
      if(userId === currentUser.id) {
          alert("You cannot delete your own account.");
          return;
      }
      if(window.confirm("Are you sure you want to delete this user?")){
          try {
            await apiClient(`/users/${userId}`, { method: 'DELETE' });
            fetchUsers(); // Refresh data
          } catch (err: any) {
            alert(`Error deleting user: ${err.message}`);
          }
      }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Manage user roles and statuses.</p>
        </div>
        <button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
            <UserPlus size={18} className="mr-2" />
            Create User
        </button>
      </div>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center p-8">Loading users...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleStatusOrRoleChange(user.id, { role: e.target.value as UserRole })}
                        disabled={user.id === currentUser.id}
                        className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Switch 
                          id={`status-${user.id}`}
                          checked={user.status === 'active'} 
                          onChange={(checked) => handleStatusOrRoleChange(user.id, { status: checked ? 'active' : 'inactive' })} 
                        />
                        <span className={`ml-3 text-xs font-semibold ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(user)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={user.id === currentUser.id}><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      
      {isModalOpen && (
        <UserFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveUser}
            user={editingUser}
        />
      )}
    </div>
  );
};

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    user: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(user?.role || 'frontend');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: Partial<User> = { name, email, role };
        // Only include password if creating a new user or changing it
        if (!user || password) {
            userData.password = password;
        }
        onSave(userData);
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Create User"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={user ? "Leave blank to keep unchanged" : ""} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md" required={!user} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                    </select>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Save User</button>
                </div>
            </form>
      </Modal>
    );
}

export default UserManagement;