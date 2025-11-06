import React, { useEffect, useState } from 'react';
import api from '../services/api';
import authService from '../services/authService';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/api/admin/users', { headers: { Authorization: `Bearer ${authService.getToken()}` } })
      .then(res => setUsers(res.data))
      .catch(err => alert('Cannot load users'));
  }, []);

  const promote = (id) => {
    api.post(`/api/admin/users/${id}/promote`, {}, { headers: { Authorization: `Bearer ${authService.getToken()}` } })
      .then(()=> alert('Promoted'))
      .catch(()=> alert('Failed'));
  };

  const unlock = (id) => {
    api.post(`/api/admin/users/${id}/unlock`, {}, { headers: { Authorization: `Bearer ${authService.getToken()}` } })
      .then(()=> alert('Unlocked'))
      .catch(()=> alert('Failed'));
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Failed</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.failedAttempt}</td>
              <td>
                <button onClick={()=>promote(u.id)}>Promote</button>
                <button onClick={()=>unlock(u.id)}>Unlock</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
