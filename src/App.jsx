import "./App.css";
import { Routes, Route } from "react-router";
import { useLocation } from "react-router-dom";

// pages
import HomePage from "./pages/HomePage"
import IncidentsPage from "./pages/IncidentsPage"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import PrivatePageExample from "./pages/PrivatePageExample";

// components
import Navbar from "./components/Navbar"
import OnlyPrivate from "./components/OnlyPrivate";

function App() {
  const location = useLocation()
  const showStarterNavbar = !["/", "/incidents", "/signup", "/login"].includes(location.pathname)

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
        <Route path="/" element={<OnlyPrivate><HomePage /></OnlyPrivate>} />
        <Route path="/incidents" element={<OnlyPrivate><IncidentsPage /></OnlyPrivate>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/private-page-example" element={<OnlyPrivate> <PrivatePageExample /> </OnlyPrivate>} />

        {/* error FE routes here... */}

      </Routes>
    </div>
  )
}

export default App
