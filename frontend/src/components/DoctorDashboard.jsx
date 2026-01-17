// Doctor Dashboard - Simple Version
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const DoctorDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    patientId: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });


  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, appointmentsRes, patientsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/appointments/today`, { headers }),
        axios.get(`${API_URL}/patients`, { headers })
      ]);

      setStats(statsRes.data);
      setTodayAppointments(appointmentsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/medical/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientRecords(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientRecords(patient._id);
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/medical`, recordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Medical record added!');
      setShowAddRecord(false);
      setRecordForm({ patientId: '', diagnosis: '', prescription: '', notes: '' });
      if (selectedPatient) {
        fetchPatientRecords(selectedPatient._id);
      }
    } catch (error) {
      alert('Failed to add record');
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      await axios.put(`${API_URL}/appointments/${id}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment completed');
      fetchData();
    } catch (error) {
      alert('Failed to update');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="flex-between">
          <div>
            <h1>Doctor Dashboard</h1>
            <p>Welcome, Dr. {user.name}</p>
          </div>
          <button onClick={onLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.todayAppointments || 0}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalPatients || 0}</div>
            <div className="stat-label">Total Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completedAppointments || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.medicalRecords || 0}</div>
            <div className="stat-label">Records Created</div>
          </div>
        </div>

        <div className="card">
          <div style={{ borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('appointments')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'appointments' ? '3px solid #007bff' : 'none',
                fontWeight: activeTab === 'appointments' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Today's Appointments
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'patients' ? '3px solid #007bff' : 'none',
                fontWeight: activeTab === 'patients' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Patients
            </button>
          </div>

          {activeTab === 'appointments' && (
            <div>
              <h2>Today's Schedule</h2>
              {todayAppointments.length === 0 ? (
                <p className="text-center">No appointments today</p>
              ) : (
                todayAppointments.map(apt => (
                  <div key={apt._id} className="card">
                    <div className="flex-between">
                      <div>
                        <h3>{apt.patientId?.name || apt.patientName}</h3>
                        <p>Time: {apt.time}</p>
                        <p>Age: {apt.patientId?.age} | Contact: {apt.patientId?.contact}</p>
                        {apt.reason && <p>Reason: {apt.reason}</p>}
                      </div>
                      <div>
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={() => handleCompleteAppointment(apt._id)}
                            className="btn-success"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'patients' && (
            <div>
              <div className="flex-between mb-20">
                <h2>All Patients</h2>
                <button
                  onClick={() => setShowAddRecord(!showAddRecord)}
                  className="btn-primary"
                >
                  {showAddRecord ? 'Cancel' : 'Add Medical Record'}
                </button>
              </div>

              {showAddRecord && (
                <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3>Add Medical Record</h3>
                  <form onSubmit={handleAddRecord}>
                    <label>Select Patient *</label>
                    <select
                      value={recordForm.patientId}
                      onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })}
                      required
                    >
                      <option value="">Choose patient</option>
                      {patients.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>

                    <label>Diagnosis</label>
                    <textarea
                      value={recordForm.diagnosis}
                      onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                      rows="2"
                    />

                    <label>Prescription</label>
                    <textarea
                      value={recordForm.prescription}
                      onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                      rows="2"
                    />

                    <label>Notes</label>
                    <textarea
                      value={recordForm.notes}
                      onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                      rows="3"
                    />

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                      Add Record
                    </button>
                  </form>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
                {patients.map(patient => (
                  <div
                    key={patient._id}
                    className="card"
                    onClick={() => handleViewPatient(patient)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3>{patient.name}</h3>
                    <p>Age: {patient.age} | Gender: {patient.gender}</p>
                    <p>Contact: {patient.contact}</p>
                  </div>
                ))}
              </div>

              {selectedPatient && (
                <div className="card" style={{ backgroundColor: '#e7f3ff', marginTop: '20px' }}>
                  <h3>Medical History - {selectedPatient.name}</h3>
                  {patientRecords.length === 0 ? (
                    <p>No medical records</p>
                  ) : (
                    patientRecords.map(record => (
                      <div key={record._id} className="card">
                        <p><strong>Date:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
                        {record.diagnosis && <p><strong>Diagnosis:</strong> {record.diagnosis}</p>}
                        {record.prescription && <p><strong>Prescription:</strong> {record.prescription}</p>}
                        {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;