import { useState } from "react";
import Header from "./components/Header";
import Accueil from "./pages/Accueil";
import EmployeeDashboard from "./components/employes/EmployeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  const [page, setPage] = useState('home');

  return (
    <div style={{ marginTop: "90px" }}>
      <Header page={page} setPage={setPage} />
      {page === 'home' && <Accueil />}
      {/* {page === 'adminSalle' && <SallesList />}
      {page === 'adminEmploye' && <EmployesList />} */}
      {/* {page === 'adminEmploye' && <EmployesList />} */}
      {page === 'admin' && <AdminDashboard />}
      {page === 'emp' && <EmployeeDashboard />}
    </div>
  );
}

export default App;
