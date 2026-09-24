import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemStoreProvider } from './context/SystemStoreContext';

import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { TableManagementPage } from './pages/TableManagementPage';
import { OrderEntryPage } from './pages/OrderEntryPage';
import { BillingPage } from './pages/BillingPage';
import { PaymentPage } from './pages/PaymentPage';
import { ReportsPage } from './pages/ReportsPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ActiveOrdersPage } from './pages/ActiveOrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { SupplierPage } from './pages/SupplierPage';
import { QRCodeManagementPage } from './pages/QRCodeManagementPage';
import { CustomerQRMenuPage } from './pages/CustomerQRMenuPage';
import { LoyaltyPointsPage } from './pages/LoyaltyPointsPage';
import { CustomerDisplayPage } from './pages/CustomerDisplayPage';
import { CustomerDisplayManagementPage } from './pages/CustomerDisplayManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { BackupSecurityPage } from './pages/BackupSecurityPage';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <SystemStoreProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Standalone Views */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/customer-menu" element={<CustomerQRMenuPage />} />
            <Route path="/customer-display" element={<CustomerDisplayPage />} />

            {/* Admin Authenticated Dashboard & POS Routes */}
            <Route path="/" element={<ProtectedAdminRoute><DashboardPage /></ProtectedAdminRoute>} />
            <Route path="/order-entry" element={<ProtectedAdminRoute><OrderEntryPage /></ProtectedAdminRoute>} />
            <Route path="/tables" element={<ProtectedAdminRoute><TableManagementPage /></ProtectedAdminRoute>} />
            <Route path="/active-orders" element={<ProtectedAdminRoute><ActiveOrdersPage /></ProtectedAdminRoute>} />
            <Route path="/billing" element={<ProtectedAdminRoute><BillingPage /></ProtectedAdminRoute>} />
            <Route path="/payment" element={<ProtectedAdminRoute><PaymentPage /></ProtectedAdminRoute>} />
            <Route path="/menu" element={<ProtectedAdminRoute><MenuManagementPage /></ProtectedAdminRoute>} />
            <Route path="/categories" element={<ProtectedAdminRoute><CategoryManagementPage /></ProtectedAdminRoute>} />
            <Route path="/order-history" element={<ProtectedAdminRoute><OrderHistoryPage /></ProtectedAdminRoute>} />
            <Route path="/inventory" element={<ProtectedAdminRoute><InventoryPage /></ProtectedAdminRoute>} />
            <Route path="/suppliers" element={<ProtectedAdminRoute><SupplierPage /></ProtectedAdminRoute>} />
            <Route path="/reports" element={<ProtectedAdminRoute><ReportsPage /></ProtectedAdminRoute>} />
            <Route path="/qr-codes" element={<ProtectedAdminRoute><QRCodeManagementPage /></ProtectedAdminRoute>} />
            <Route path="/loyalty" element={<ProtectedAdminRoute><LoyaltyPointsPage /></ProtectedAdminRoute>} />
            <Route path="/display-settings" element={<ProtectedAdminRoute><CustomerDisplayManagementPage /></ProtectedAdminRoute>} />
            <Route path="/settings" element={<ProtectedAdminRoute><SettingsPage /></ProtectedAdminRoute>} />
            <Route path="/backup" element={<ProtectedAdminRoute><BackupSecurityPage /></ProtectedAdminRoute>} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SystemStoreProvider>
    </AuthProvider>
  );
}
