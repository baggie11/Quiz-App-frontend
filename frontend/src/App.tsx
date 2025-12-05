import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HostAuthPage from "./pages/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path = "/auth" element = {<HostAuthPage/>}/>

        {/* Add more routes below when you create new pages */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
