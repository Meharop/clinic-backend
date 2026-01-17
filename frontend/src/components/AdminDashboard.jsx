// Admin Dashboard - Universal Control Version
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // State for Edit Modal
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(''); // 'user', 'patient', 'appointment'
  const [editFormData, setEditFormData] = useState({});


  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, patientsRes, appointmentsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/dashboard/users`, { headers }),
        axios.get(`${API_URL}/patients`, { headers }),
        axios.get(`${API_URL}/appointments`, { headers })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // --- Modal Handlers ---

  const handleEditClick = (item, type) => {
    setEditingItem(item);
    setEditType(type);

    // Pre-fill form based on type
    if (type === 'appointment') {
      setEditFormData({
        date: new Date(item.date).toISOString().split('T')[0],
        time: item.time,
        status: item.status,
        reason: item.reason || ''
      });
    } else if (type === 'user') {
      setEditFormData({
        name: item.name,
        email: item.email,
        role: item.role,
        phone: item.phone || ''
      });
    } else if (type === 'patient') {
      setEditFormData({
        name: item.name,
        age: item.age,
        gender: item.gender,
        contact: item.contact,
        email: item.email || '',
        bloodGroup: item.bloodGroup || ''
      });
    }
  };

  const closeModal = () => {
    setEditingItem(null);
    setEditType('');
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      let endpoint = '';
      if (editType === 'appointment') endpoint = `/appointments/${editingItem._id}`;
      if (editType === 'user') endpoint = `/users/${editingItem._id}`;
      if (editType === 'patient') endpoint = `/patients/${editingItem._id}`;

      await axios.put(`${API_URL}${endpoint}`, editFormData, { headers });
      alert(`${editType.charAt(0).toUpperCase() + editType.slice(1)} updated successfully!`);
      fetchData(); // Refresh list
      closeModal();
    } catch (error) {
      console.error(`Error updating ${editType}:`, error);
      alert(`Failed to update ${editType}.`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently DELETE this ${editType}?`)) {
      try {
        let endpoint = '';
        if (editType === 'appointment') endpoint = `/appointments/${editingItem._id}`;
        if (editType === 'user') endpoint = `/users/${editingItem._id}`;
        if (editType === 'patient') endpoint = `/patients/${editingItem._id}`;

        await axios.delete(`${API_URL}${endpoint}`, { headers });
        alert(`${editType.charAt(0).toUpperCase() + editType.slice(1)} deleted successfully!`);
        fetchData(); // Refresh list
        closeModal();
      } catch (error) {
        console.error(`Error deleting ${editType}:`, error);
        alert(`Failed to delete ${editType}.`);
      }
    }
  };

  const renderModalContent = () => {
    if (editType === 'appointment') {
      return (
        <>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={editFormData.date} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" value={editFormData.time} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={editFormData.status} onChange={handleInputChange}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Reason / Notes</label>
            <input type="text" name="reason" value={editFormData.reason} onChange={handleInputChange} />
          </div>
        </>
      );
    }

    if (editType === 'user') {
      return (
        <>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={editFormData.name} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={editFormData.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={editFormData.role} onChange={handleInputChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={editFormData.phone} onChange={handleInputChange} />
          </div>
        </>
      );
    }

    if (editType === 'patient') {
      return (
        <>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={editFormData.name} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" value={editFormData.age} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={editFormData.gender} onChange={handleInputChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input type="text" name="contact" value={editFormData.contact} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <input type="text" name="bloodGroup" value={editFormData.bloodGroup} onChange={handleInputChange} placeholder="e.g. O+" />
          </div>
        </>
      );
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="flex-between">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.name}</p>
          </div>
          <button onClick={onLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card" style={{ backgroundColor: '#007bff', color: 'white' }}>
            <div className="stat-number">{stats.totalPatients || 0}</div>
            <div className="stat-label" style={{ color: 'white' }}>Total Patients</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#28a745', color: 'white' }}>
            <div className="stat-number">{stats.totalDoctors || 0}</div>
            <div className="stat-label" style={{ color: 'white' }}>Total Doctors</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#ffc107', color: 'white' }}>
            <div className="stat-number">{stats.todayAppointments || 0}</div>
            <div className="stat-label" style={{ color: 'white' }}>Today's Appointments</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#6f42c1', color: 'white' }}>
            <div className="stat-number">{stats.totalAppointments || 0}</div>
            <div className="stat-label" style={{ color: 'white' }}>Total Appointments</div>
          </div>
        </div>

        <div className="card">
          {/* Navigation Tabs */}
          <div style={{ borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
            {['overview', 'users', 'patients', 'appointments'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab ? '3px solid #007bff' : 'none',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <h2>System Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="card">
                  <h3>User Distribution</h3>
                  <div style={{ marginTop: '10px' }}>
                    <div className="flex-between" style={{ padding: '5px 0' }}>
                      <span>Patients:</span>
                      <strong>{users.filter(u => u.role === 'patient').length}</strong>
                    </div>
                    <div className="flex-between" style={{ padding: '5px 0' }}>
                      <span>Doctors:</span>
                      <strong>{users.filter(u => u.role === 'doctor').length}</strong>
                    </div>
                    <div className="flex-between" style={{ padding: '5px 0' }}>
                      <span>Receptionists:</span>
                      <strong>{users.filter(u => u.role === 'receptionist').length}</strong>
                    </div>
                    <div className="flex-between" style={{ padding: '5px 0' }}>
                      <span>Admins:</span>
                      <strong>{users.filter(u => u.role === 'admin').length}</strong>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>System Activity</h3>
                  <div style={{ marginTop: '10px' }}>
                    <p>Total System Users: {users.length}</p>
                    <p>Registered Patients: {patients.length}</p>
                    <p>Total Appointments: {appointments.length}</p>
                    <p style={{ color: '#28a745', fontWeight: 'bold' }}>Status: Active ✓</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <h2>All Users</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(usr => (
                    <tr key={usr._id}>
                      <td>{usr.name}</td>
                      <td>{usr.email}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: usr.role === 'admin' ? '#6f42c1' :
                            usr.role === 'doctor' ? '#007bff' :
                              usr.role === 'receptionist' ? '#28a745' : '#6c757d',
                          color: 'white'
                        }}>
                          {usr.role}
                        </span>
                      </td>
                      <td>{usr.phone || 'N/A'}</td>
                      <td>
                        <button className="btn-edit" onClick={() => handleEditClick(usr, 'user')}>✏️ Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PATIENTS TAB */}
          {activeTab === 'patients' && (
            <div>
              <h2>All Patients</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {patients.map(patient => (
                  <div key={patient._id} className="card">
                    <div className="flex-between">
                      <h3>{patient.name}</h3>
                      <button className="btn-edit" onClick={() => handleEditClick(patient, 'patient')}>✏️ Edit</button>
                    </div>
                    <p>Age: {patient.age} | Gender: {patient.gender}</p>
                    <p>Contact: {patient.contact}</p>
                    {patient.email && <p>Email: {patient.email}</p>}
                    {patient.bloodGroup && <p>Blood: {patient.bloodGroup}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div>
              <h2>All Appointments</h2>
              {appointments.map(apt => (
                <div key={apt._id} className="card">
                  <div className="flex-between">
                    <div>
                      <h3>{apt.patientName}</h3>
                      <p>Doctor: {apt.doctorName}</p>
                      <p>{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                      {apt.reason && <p>Reason: {apt.reason}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(apt, 'appointment')}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal() }}>
          <div className="modal-content">
            <h2>Edit {editType.charAt(0).toUpperCase() + editType.slice(1)}</h2>

            {renderModalContent()}

            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
              <div style={{ flex: 1 }}></div> {/* Spacer */}
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;