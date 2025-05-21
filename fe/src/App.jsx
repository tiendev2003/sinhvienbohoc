import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router";
import "./App.css";

// This will be implemented later when we create the actual routes file
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";

// These will be implemented later when we create the actual context providers
// import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { NotificationProvider } from './context/NotificationContext';
// import { UserProvider } from './context/UserContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Trường Học Management System...</p>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        {/* <ThemeProvider>
          <NotificationProvider>
            <UserProvider> */}
        <AppRoutes />
        {/* </UserProvider>
          </NotificationProvider>
        </ThemeProvider>*/}
      </AuthProvider>
    </Router>
  );
}

export default App;
