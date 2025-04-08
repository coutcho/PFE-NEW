import { Routes, Route } from "react-router-dom";
import NavbarD from "./NavbarD";
import Dashboard from "./Dashboard";
import Properties from "./Properties";
import Users from "./Users";

function AdminPage() {
  return (
    <div className="d-flex">
      
      <div className="flex-grow-1">
        <NavbarD />
        <div style={{ marginTop: "56px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="users" element={<Users />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;