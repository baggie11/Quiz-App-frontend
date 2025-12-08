import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HostAuthPage from "./pages/AuthPage";
import HostDashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path = "/auth" element = {<HostAuthPage/>}/>
        <Route path = "/dashboard" element = {<HostDashboard/>}/>

        {/* Add more routes below when you create new pages */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
