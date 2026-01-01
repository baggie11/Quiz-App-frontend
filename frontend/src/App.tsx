import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HostAuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/Dashboard";
import QuestionBuilderPage from "./pages/QuestionBuilderPageWrapper";
import QuizVisionHome from "./pages/Role";
import QuizVision from "./pages/LandingPage";
import RollNumberVision from "./pages/NamePage";
import QuizPlayPage from "./pages/SessionPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path = "/" element = {<QuizVisionHome/>}/>
        <Route path = "/join-session" element = {<QuizVision/>}/>
        <Route path = "/auth" element = {<HostAuthPage/>}/>
        <Route path = "/dashboard" element = {<DashboardPage/>}/>
        <Route path="/session/:sessionId/questions" element={<QuestionBuilderPage 
      sessionId="" // Pass empty string or dummy value
      onSave={(questions) => console.log('Save:', questions)}
      onPreview={(questions) => console.log('Preview:', questions)}
    />} />
        {/* <Route path = "/simpletts" element = {<SimpleTTS/>}/> */}
        <Route path = "/enter-name" element = {<RollNumberVision/>}/>
        {/* Add more routes below when you create new pages */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path = "/session/:sessionId" element = {<QuizPlayPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;



// frontend/src/App.jsx
// App.jsx


// App.jsx
// frontend/src/App.jsx
