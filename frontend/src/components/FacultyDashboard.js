import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { devLog } from '../utils/logger';

const FacultyDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState('');
  const [adminId, setAdminId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const response = await axios.get('/api/admin/status');
        const { isAdmin, adminRole, adminId } = response.data;
        setIsAdmin(isAdmin);
        setAdminRole(adminRole);
        setAdminId(adminId);
        devLog('FacultyDashboard - Faculty admin status:', { isAdmin, adminRole, adminId });
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    };

    fetchAdminStatus();
  }, []);

  const handleNavigation = () => {
    devLog('FacultyDashboard - Passing admin status to routes:', { isAdmin, adminRole, adminId });
    navigate('/admin/dashboard', { state: { isAdmin, adminRole, adminId } });
  };

  return (
    <div>
      <h1>Faculty Dashboard</h1>
      <button onClick={handleNavigation}>Go to Admin Dashboard</button>
    </div>
  );
};

export default FacultyDashboard;