// Main layout

import { useState } from 'react';
import { Outlet } from 'react-router';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 bg-gray-100 p-4 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {children || <Outlet />}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
