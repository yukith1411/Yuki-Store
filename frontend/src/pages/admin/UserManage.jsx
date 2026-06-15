import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSlash, FiCheck, FiTrash2 } from 'react-icons/fi';
import API from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import '../../css/admin.css';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      toast.error('Failed to load user directories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      const { data } = await API.put(`/users/${id}/block`);
      if (data.success) {
        toast.info(data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/users/${id}`);
      if (data.success) {
        toast.info('User removed.');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Manage Customers</h2>

      {loading ? (
        <Skeleton height="300px" />
      ) : (
        <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((usr) => (
                <tr key={usr._id}>
                  <td><strong>{usr.name}</strong></td>
                  <td>{usr.email}</td>
                  <td>{usr.mobile || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${usr.role === 'admin' ? 'info' : 'success'}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      {usr.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${usr.isBlocked ? 'danger' : 'success'}`}>
                      {usr.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {usr.role !== 'admin' && (
                      <>
                        <button
                          className="btn btn-outline"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            borderColor: usr.isBlocked ? 'var(--success)' : 'var(--warning)',
                            color: usr.isBlocked ? 'var(--success)' : 'var(--warning)',
                            marginRight: '10px'
                          }}
                          onClick={() => handleToggleBlock(usr._id)}
                        >
                          {usr.isBlocked ? <><FiCheck /> Unblock</> : <><FiSlash /> Block</>}
                        </button>
                        <button
                          className="nav-action-btn"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDeleteUser(usr._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManage;
