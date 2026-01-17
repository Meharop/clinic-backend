// Receptionist Dashboard - Simple Version
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const ReceptionistDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: '', age: '', gender: 'Male', contact: '', email: '', address: '', bloodGroup: ''
  });
  const [bookingForm, setBookingForm] = useState({
    patientId: '', doctorId: '', date: '', time: '', reason: ''
  });


  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/patients`, { headers }),
        axios.get(`${API_URL}/appointments`, { headers }),
        axios.get(`${API_URL}/dashboard/doctors`, { headers })
      ]);

      setStats(statsRes.data);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/patients`, patientForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Patient added!');
      setShowAddPatient(false);
      setPatientForm({ name: '', age: '', gender: 'Male', contact: '', email: '', address: '', bloodGroup: '' });
      fetchData();
    } catch (error) {
      alert('Failed to add patient');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/appointments`, bookingForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment booked!');
      setShowBooking(false);
      setBookingForm({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (error) {
      alert('Failed to book appointment');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div className="flex-between">
          <div>
            <h1>Receptionist Dashboard</h1>
            <p>Welcome, {user.name}</p>
          </div>
          <button onClick={onLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalPatients || 0}</div>
            <div className="stat-label">Total Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.todayAppointments || 0}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalAppointments || 0}</div>
            <div className="stat-label">Total Appointments</div>
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
              Appointments
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
              <div className="flex-between mb-20">
                <h2>Manage Appointments</h2>
                <button
                  onClick={() => setShowBooking(!showBooking)}
                  className="btn-primary"
                >
                  {showBooking ? 'Cancel' : 'Book Appointment'}
                </button>
              </div>

              {showBooking && (
                <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3>Book New Appointment</h3>
                  <form onSubmit={handleBookAppointment}>
                    <label>Patient *</label>
                    <select
                      value={bookingForm.patientId}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientId: e.target.value })}
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>

                    <label>Doctor *</label>
                    <select
                      value={bookingForm.doctorId}
                      onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
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
                    <input
                      type="text"
                      value={bookingForm.reason}
                      onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                      placeholder="Reason for visit"
                    />

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                      Book Appointment
                    </button>
                  </form>
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                {appointments.map(apt => (
                  <div key={apt._id} className="card">
                    <div className="flex-between">
                      <div>
                        <h3>{apt.patientName}</h3>
                        <p>Dr. {apt.doctorName}</p>
                        <p>{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                      </div>
                      <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div>
              <div className="flex-between mb-20">
                <h2>Manage Patients</h2>
                <button
                  onClick={() => setShowAddPatient(!showAddPatient)}
                  className="btn-primary"
                >
                  {showAddPatient ? 'Cancel' : 'Add Patient'}
                </button>
              </div>

              {showAddPatient && (
                <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3>Add New Patient</h3>
                  <form onSubmit={handleAddPatient}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label>Name *</label>
                        <input
                          type="text"
                          value={patientForm.name}
                          onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label>Age *</label>
                        <input
                          type="number"
                          value={patientForm.age}
                          onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label>Gender</label>
                        <select
                          value={patientForm.gender}
                          onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label>Contact *</label>
                        <input
                          type="text"
                          value={patientForm.contact}
                          onChange={(e) => setPatientForm({ ...patientForm, contact: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label>Email</label>
                        <input
                          type="email"
                          value={patientForm.email}
                          onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Blood Group</label>
                        <input
                          type="text"
                          value={patientForm.bloodGroup}
                          onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                        />
                      </div>
                    </div>
                    <label>Address</label>
                    <textarea
                      value={patientForm.address}
                      onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                      rows="2"
                    />
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                      Add Patient
                    </button>
                  </form>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
                {patients.map(patient => (
                  <div key={patient._id} className="card">
                    <h3>{patient.name}</h3>
                    <p>Age: {patient.age} | Gender: {patient.gender}</p>
                    <p>Contact: {patient.contact}</p>
                    {patient.bloodGroup && <p>Blood: {patient.bloodGroup}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;