import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ProductionEntry from "./pages/ProductionEntry";
import Reports from "./pages/Reports";
import PCBMapping from "./pages/PCBMapping";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Also from "./pages/Also";
import LowStock from "./pages/LowStock";
import ExportPage from "./pages/Export";
import ImportPage from "./pages/Import";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/also" element={<Also />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <Dashboard />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <Inventory />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/production"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <ProductionEntry />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pcb-mapping"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <PCBMapping />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/low-stock"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <LowStock />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <Reports />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/export"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <ExportPage />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <div className="main-area">
                  <Navbar />
                  <ImportPage />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
