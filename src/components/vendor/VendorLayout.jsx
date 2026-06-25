import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';
import Vendornavbar from './Vendornavbar';
import './vendor.css';

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="vendor-shell">
      <VendorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="vendor-main">
        <Vendornavbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <div className="vendor-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
