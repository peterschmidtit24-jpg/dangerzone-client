import "./App.css";
import { Routes, Route } from "react-router";
import { useLocation } from "react-router-dom";

// pages
import HomePage from "./pages/HomePage"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import PrivatePageExample from "./pages/PrivatePageExample";

// components
import Navbar from "./components/Navbar"
import OnlyPrivate from "./components/OnlyPrivate";

function App() {
  const location = useLocation()
  const showStarterNavbar = location.pathname !== "/"

  return (
    <div>
      {showStarterNavbar && (
        <>
          <Navbar />
          <br />
          <hr />
        </>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/private-page-example" element={<OnlyPrivate> <PrivatePageExample /> </OnlyPrivate>} />

        {/* error FE routes here... */}

      </Routes>
    </div>
  )
}

export default App
