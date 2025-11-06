import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { token, user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Log the API base URL being used
        console.log('API Base URL:', import.meta.env.VITE_API_URL || 'Using proxy via /');
        
        const userRes = await api.get(`/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Users response:', userRes);
        
        const auditRes = await api.get(`/api/admin/audit`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Audit response:', auditRes);

        // Normalize user objects so the UI can always read `failedAttempts` and `accountNonLocked`
        const normalizedUsers = (userRes.data || []).map((u) => ({
          ...u,
          failedAttempts:
            u.failedAttempts ??
            u.failedAttempt ??
            u.failed_attempts ??
            u.failedAttemptsCount ??
            u.failed_attempts_count ??
            u.failedLoginAttempts ??
            0,
          accountNonLocked: (u.accountNonLocked ?? u.account_non_locked ?? true),
        }));

        setUsers(normalizedUsers);
        setAuditLogs(auditRes.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.response?.data?.message || err.message || "Failed to load data");
        // If it's an auth error, logout
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [token]);

  const handlePromote = async (id) => {
    try {
      await api.put(`/api/admin/users/${id}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update UI locally without a full reload
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u)));
      alert("User promoted to ADMIN successfully!");
    } catch (err) {
      console.error(err);
    }
  };
  const handleDemote = async (id) => {
  try {
    await api.put(`/api/admin/users/${id}/demote`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Update UI locally (just like promote)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: "USER" } : u)));
    alert("Admin removed successfully — user is now NORMAL USER!");
  } catch (err) {
    console.error("Error removing admin:", err.response?.data || err.message);
  }
};

  const handleUnlock = async (id) => {
    try {
      await api.put(`/api/admin/users/${id}/unlock`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update UI locally: reset failedAttempts and mark account non-locked
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, failedAttempts: 0, accountNonLocked: true }
            : u
        )
      );
      alert("User unlocked successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading admin data...</div>;
  
  // if (error) return (
  //   <div className="container mt-5">
  //     <div className="alert alert-danger">
  //       <h4>Error Loading Data</h4>
  //       <p>{error}</p>
  //       <button className="btn btn-primary" onClick={() => window.location.reload()}>
  //         Try Again
  //       </button>
  //     </div>
  //   </div>
  // );

  return (
    <div className="container-fluid w-75 mt-5">
      <div className="card p-4 shadow">
        <h2 className="text-center text-primary mb-4">
           Hello <span className="text-danger">Admin</span> {user?.name}
        </h2>

        <div className="d-flex justify-content-between mb-3 align-items-center">
          <h4 className="mb-0">All Registered Users</h4>

          <div className="d-flex align-items-center" style={{ maxWidth: 480, flex: 1, margin: '0 1rem' }}>
            <input
              type="search"
              className="form-control"
              placeholder="Search by email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary ms-2"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          </div>

          <button className="btn btn-outline-danger" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="table-responsive mb-5">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Failed Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) =>
                  search.trim()
                    ? (u.email || "").toLowerCase().includes(search.trim().toLowerCase())
                    : true
                )
                .map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.failedAttempts}</td>
                  <td>
  {u.role === "USER" ? (
    <button
      className="btn btn-sm btn-success me-2"
      onClick={() => handlePromote(u.id)}
    >
      Promote
    </button>
  ) : (
    <button
      className="btn btn-sm btn-danger me-2"
      onClick={() => handleDemote(u.id)}
    >
      Remove Admin
    </button>
  )}

  {u.accountNonLocked === false && (
    <button
      className="btn btn-sm btn-warning"
      onClick={() => handleUnlock(u.id)}
    >
      Unlock
    </button>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4>All Audit Logs</h4>
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Action</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td>{log.email}</td>
                  <td>{log.action}</td>
                  <td>{log.status}</td>
                  <td>{(log.timestamp || log.timeStamp)?.replace("T", " ").split(".")[0]}</td>
                  <td>{log.ipAddress || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
