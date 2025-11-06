import { useContext, useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { token, user, logout } = useContext(AuthContext);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user audit logs
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      try {
        // Use the relative path so the Vite dev proxy (vite.config.js) forwards
        // this to the backend and avoids CORS in development.
        const res = await api.get(`/api/user/audit`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuditLogs(res.data);
      } catch (err) {
        console.error("Error fetching audits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleLogout = async () => {
    try {
      await api.post(
        `/api/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading dashboard...</div>;

  return (
    <div className="container-fluid mt-5">
      <div className="card p-4">
        <h2 className="text-center mb-3">
          Hello {user?.name}{" "}
          {user?.role === "ADMIN" && (
            <span className="badge bg-danger ms-2">Admin</span>
          )}
        </h2>
        <p className="text-center text-muted">
          Logged in as <strong>{user?.email}</strong>
        </p>

        <div className="text-center mt-3">
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Logout
          </button>
        </div>

        <hr />

        <h4 className="mt-4 mb-3">Your Login / Logout History</h4>

        {auditLogs.length === 0 ? (
          <p className="text-muted">No activity yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  {/* <th>IP Address</th> */}
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>
                    <td>{log.action}</td>
                    <td>{log.status}</td>
                    <td>{log.timestamp?.replace("T", " ").split(".")[0]}</td>
                    {/* <td>{log.ipAddress || "N/A"}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
