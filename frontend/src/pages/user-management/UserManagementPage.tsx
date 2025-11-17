import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types.ts';
import Card from '../../components/ui/Card.tsx';
import Switch from '../../components/ui/Switch.tsx';
import Modal from '../../components/ui/Modal.tsx';
import { Edit, Trash2, UserPlus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';
import { useDashboardContext } from '../../components/layout/DashboardLayout.tsx';

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useDashboardContext();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // State for search and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to page 1 on new search
    }, 300);

    return () => {
        clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: limit.toString(),
            search: debouncedSearchTerm,
        });

      const response = await apiClient<{ 
        success: true; 
        data: {
            users: User[];
            totalUsers: number;
            page: number;
            totalPages: number;
        } 
    }>(`/users?${params.toString()}`);
      
      setUsers(response.data.users);
      setTotalUsers(response.data.totalUsers);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.page);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusOrRoleChange = async (userId: string, updateData: Partial<User>) => {
    const originalUsers = [...users];
    setUsers(users.map(user => user.id === userId ? { ...user, ...updateData } : user));

    try {
      await apiClient(`/users/${userId}`, {
        method: 'PUT',
        body: updateData,
      });
    } catch (err) {
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
            await apiClient(`/users/${editingUser.id}`, { method: 'PUT', body: userData });
        } else { // Create
            await apiClient('/users', { method: 'POST', body: userData });
        }
        handleCloseModal();
        fetchUsers();
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
            fetchUsers();
          } catch (err: any) {
            alert(`Error deleting user: ${err.message}`);
          }
      }
  }

  const Pagination = () => (
    <div className="flex justify-between items-center mt-4 px-6 pb-4 text-sm">
      <div>
        <span className="text-gray-600 dark:text-gray-400">
          Showing {Math.min((currentPage - 1) * limit + 1, totalUsers)} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading} className="p-2 disabled:opacity-50"><ChevronLeft size={16}/></button>
        <span className="px-2">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0 || isLoading} className="p-2 disabled:opacity-50"><ChevronRight size={16}/></button>
      </div>
    </div>
  );


  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Manage user roles and statuses.</p>
        </div>
        <button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg w-full sm:w-auto mt-4 sm:mt-0">
            <UserPlus size={18} className="mr-2" />
            Create User
        </button>
      </div>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="mb-4 relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border rounded-lg focus:outline-none"
          />
      </div>

      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center p-8">Loading users...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <select value={user.role} onChange={(e) => handleStatusOrRoleChange(user.id, { role: e.target.value as UserRole })} disabled={user.id === currentUser.id} className="bg-gray-100 dark:bg-gray-800 border rounded-md p-1 disabled:opacity-50">
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Switch id={`status-${user.id}`} checked={user.status === 'active'} onChange={(checked) => handleStatusOrRoleChange(user.id, { status: checked ? 'active' : 'inactive' })} />
                        <span className={`ml-3 text-xs font-semibold ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(user)} className="text-primary-600 mr-4"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 disabled:opacity-50" disabled={user.id === currentUser.id}><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(!isLoading && users.length === 0) && (
            <div className="text-center p-8 text-gray-500">No users found.</div>
          )}
        </div>
        {!isLoading && totalPages > 0 && <Pagination />}
      </Card>
      
      {isModalOpen && (
        <UserFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} user={editingUser}/>
      )}
    </div>
  );
};

const UserFormModal: React.FC<{isOpen: boolean; onClose: () => void; onSave: (user: Partial<User>) => void; user: User | null;}> = ({ isOpen, onClose, onSave, user }) => {
    const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<UserRole>('frontend');
    useEffect(() => { if(isOpen){ setName(user?.name || ''); setEmail(user?.email || ''); setRole(user?.role || 'frontend'); setPassword(''); } }, [user, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const userData: Partial<User> = { name, email, role }; if (!user || password) { userData.password = password; } onSave(userData); };
    return (<Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Create User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required /></div>
            <div><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required /></div>
            <div><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={user ? "Leave blank to keep" : ""} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md" required={!user} /></div>
            <div><label>Role</label><select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border rounded-md"><option value="frontend">Frontend</option><option value="backend">Backend</option></select></div>
            <div className="flex justify-end pt-4"><button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 text-white bg-primary-600 rounded-md">Save</button></div>
        </form>
    </Modal>);
}

export default UserManagementPage;
