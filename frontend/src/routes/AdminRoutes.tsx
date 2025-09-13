import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import RequestsPage from '../pages/Admin2/RequestsPage';
import ManageFaqPage from '../pages/Admin2/ManageFaqPage';
// import EmployerFeedPage from '../pages/Employer/EmployerFeedPage'// Import new page
import FinanceDashboardPage from '../pages/Admin2/FinancePage';

const AdminRoutes: React.FC = () => {
  const isAdmin = true; // Should be replaced with real auth logic

  if (!isAdmin) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<RequestsPage />} />
        <Route path="/manage-faq" element={<ManageFaqPage />} />
        {/*<Route path="/feed" element={<EmployerFeedPage />} />  Add new route */} 
        <Route path="/finance/summary" element={<FinanceDashboardPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;