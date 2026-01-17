// Patient Dashboard
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  // Fetch all data when component loads
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch stats, appointments, doctors, and medical records
      const [statsRes, appointmentsRes, doctorsRes, recordsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/appointments`, { headers }),
        axios.get(`${API_URL}/dashboard/doctors`, { headers }),
        axios.get(`${API_URL}/medical`, { headers })
      ]);

      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setMedicalRecords(recordsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Book new appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/appointments`, bookingForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment booked successfully!');
      setShowBooking(false);
      setBookingForm({ doctorId: '', date: '', time: '', reason: '' });
      fetchData(); // Refresh data
    } catch (error) {
      alert('Failed to book appointment');
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.patch(`${API_URL}/appointments/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Appointment cancelled');
        fetchData(); // Refresh data
      } catch (error) {
        alert('Failed to cancel appointment');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div className="flex-between">
          <div>
            <h1>Patient Dashboard</h1>
            <p>Welcome, {user.name}</p>
          </div>
          <button onClick={onLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="container">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalAppointments || 0}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.upcomingAppointments || 0}</div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.medicalRecords || 0}</div>
            <div className="stat-label">Medical Records</div>
          </div>
        </div>

        {/* Tabs */}
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
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab('records')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'records' ? '3px solid #007bff' : 'none',
                fontWeight: activeTab === 'records' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Medical Records
            </button>
          </div>

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              <div className="flex-between mb-20">
                <h2>Appointments</h2>
                <button
                  onClick={() => setShowBooking(!showBooking)}
                  className="btn-primary"
                >
                  {showBooking ? 'Cancel' : 'Book Appointment'}
                </button>
              </div>

              {/* Booking Form */}
              {showBooking && (
                <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3>Book New Appointment</h3>
                  <form onSubmit={handleBookAppointment}>
                    <label>Select Doctor *</label>
                    <select
                      value={bookingForm.doctorId}
                      onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                      required
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map(doc => (
                        <option key={doc._id} value={doc._id}>{doc.name}</option>
                      ))}
                    </select>

                    <label>Date *</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />

                    <label>Time *</label>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      required
                    />

                    <label>Reason</label>
                    <textarea
                      value={bookingForm.reason}
                      onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                      placeholder="Reason for visit"
                      rows="3"
                    />

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                      Book Appointment
                    </button>
                  </form>
                </div>
              )}

              {/* Appointments List */}
              <div style={{ marginTop: '20px' }}>
                {appointments.length === 0 ? (
                  <p className="text-center">No appointments found</p>
                ) : (
                  appointments.map(apt => (
                    <div key={apt._id} className="card">
                      <div className="flex-between">
                        <div>
                          <h3>Dr. {apt.doctorName}</h3>
                          <p>{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                          {apt.reason && <p style={{ color: '#666' }}>Reason: {apt.reason}</p>}
                        </div>
                        <div>
                          <span className={`badge badge-${apt.status}`}>
                            {apt.status}
                          </span>
                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="btn-danger"
                              style={{ marginLeft: '10px' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div>
              <h2>Medical Records</h2>
              {medicalRecords.length === 0 ? (
                <p className="text-center">No medical records found</p>
              ) : (
                medicalRecords.map(record => (
                  <div key={record._id} className="card">
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Dr. {record.doctorName}</strong>
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {record.diagnosis && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Diagnosis:</strong>
                        <p>{record.diagnosis}</p>
                      </div>
                    )}
                    {record.prescription && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Prescription:</strong>
                        <p>{record.prescription}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Notes:</strong>
                        <p>{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;