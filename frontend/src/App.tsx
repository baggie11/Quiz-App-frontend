import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HostAuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/Dashboard";
import QuestionBuilderPage from "./pages/QuestionPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path = "/auth" element = {<HostAuthPage/>}/>
        <Route path = "/dashboard" element = {<DashboardPage/>}/>
        <Route path = "/question" element = {<QuestionBuilderPage
        sessionId="session-123"
        />}/>

        {/* Add more routes below when you create new pages */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;



// frontend/src/App.jsx
// App.jsx


// App.jsx
// frontend/src/App.jsx
