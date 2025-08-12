import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('register');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage('Error fetching employee data');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/employees`, formData);
      setMessage('Employee registered successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: ''
      });
      fetchEmployees();
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage('Error registering employee');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Employee Registration System</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => setActiveTab('register')}
          >
            Register Employee
          </button>
          <button 
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            View Employees ({employees.length})
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'register' && (
          <div className="registration-form">
            <h2>Register New Employee</h2>
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">Position:</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department:</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? 'Registering...' : 'Register Employee'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="employee-list">
            <h2>Registered Employees</h2>
            {employees.length === 0 ? (
              <p className="no-employees">No employees registered yet.</p>
            ) : (
              <div className="employee-grid">
                {employees.map((employee) => (
                  <div key={employee.id} className="employee-card">
                    <h3>{employee.name}</h3>
                    <div className="employee-details">
                      <p><strong>Email:</strong> {employee.email}</p>
                      <p><strong>Phone:</strong> {employee.phone}</p>
                      <p><strong>Position:</strong> {employee.position}</p>
                      <p><strong>Department:</strong> {employee.department}</p>
                      <p><strong>Registered:</strong> {new Date(employee.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={fetchEmployees} 
              className="refresh-btn"
            >
              Refresh List
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
