import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { RoleGuard } from './components/shared/RoleGuard';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyProduce from './pages/farmer/MyProduce';
import TransportRequests from './pages/farmer/TransportRequests';
import FarmerDeals from './pages/farmer/FarmerDeals';
import StorageGuide from './pages/farmer/StorageGuide';

import TransportDashboard from './pages/transport/TransportDashboard';
import BrowseRequests from './pages/transport/BrowseRequests';
import MyJobs from './pages/transport/MyJobs';
import ReportFailure from './pages/transport/ReportFailure';

import DealerDashboard from './pages/dealer/DealerDashboard';
import BrowseProduce from './pages/dealer/BrowseProduce';
import MyDeals from './pages/dealer/MyDeals';

import AdminDashboard from './pages/admin/AdminDashboard';
import AllUsers from './pages/admin/AllUsers';
import AllProduce from './pages/admin/AllProduce';
import AllTransport from './pages/admin/AllTransport';
import AllDeals from './pages/admin/AllDeals';
import AllFailures from './pages/admin/AllFailures';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  const { user, token, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center text-slate">
        Loading...
      </div>
    );
  }

  if (user && token) {
    const roleRoutes = {
      farmer: [
        { path: '/farmer', element: <FarmerDashboard /> },
        { path: '/farmer/produce', element: <MyProduce /> },
        { path: '/farmer/transport', element: <TransportRequests /> },
        { path: '/farmer/deals', element: <FarmerDeals /> },
        { path: '/farmer/guide', element: <StorageGuide /> },
      ],
      transport: [
        { path: '/transport', element: <TransportDashboard /> },
        { path: '/transport/browse', element: <BrowseRequests /> },
        { path: '/transport/jobs', element: <MyJobs /> },
        { path: '/transport/failure', element: <ReportFailure /> },
      ],
      dealer: [
        { path: '/dealer', element: <DealerDashboard /> },
        { path: '/dealer/browse', element: <BrowseProduce /> },
        { path: '/dealer/deals', element: <MyDeals /> },
      ],
      admin: [
        { path: '/admin', element: <AdminDashboard /> },
        { path: '/admin/users', element: <AllUsers /> },
        { path: '/admin/produce', element: <AllProduce /> },
        { path: '/admin/transport', element: <AllTransport /> },
        { path: '/admin/deals', element: <AllDeals /> },
        { path: '/admin/failures', element: <AllFailures /> },
      ],
    };

    const routes = roleRoutes[user.role] || [];

    return (
      <AppLayout>
        <Routes>
          {routes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
          <Route path="*" element={<Navigate to={routes[0]?.path || '/'} replace />} />
        </Routes>
      </AppLayout>
    );
  }

  return (
    <AuthLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}