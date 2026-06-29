import "../../styles/mapView.css"
import { useContext } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/auth.context"

function DangerzoneHeader({ incidentCount, onSetPosition }) {
  const navigate = useNavigate()
  const { authenticateUser, isLoggedIn, loggedUserEmail, loggedUsername } = useContext(AuthContext)
  const displayName = loggedUsername || loggedUserEmail || "Signed in"

  async function handleLogout() {
    localStorage.removeItem("authToken")
    await authenticateUser()
    navigate("/login")
  }

  return (
    <header className="dz-header">
      <div className="dz-brand">
        <span className="dz-logo">!</span>
        <span>DANGER<span>ZONE</span></span>
      </div>

      <nav className="dz-top-nav" aria-label="Dangerzone sections">
        <NavLink
          className={({ isActive }) => (
            isActive ? "dz-nav-link dz-nav-link-active" : "dz-nav-link"
          )}
          to="/"
        >
          <span>MAP</span> VIEW
        </NavLink>
        <NavLink
          className={({ isActive }) => (
            isActive ? "dz-nav-link dz-nav-link-active" : "dz-nav-link"
          )}
          to="/incidents"
        >
          INCIDENTS <span className="dz-count-badge">{incidentCount}</span>
        </NavLink>
      </nav>

      <button className="dz-position-button" onClick={onSetPosition} type="button">
        <span aria-hidden="true">A</span>
        Set Position
        <span aria-hidden="true">/</span>
      </button>

      <div className="dz-user-status">
        <span className="dz-online-dot" />
        <span>{displayName}</span>
        {isLoggedIn && (
          <button
            className="dz-logout-button"
            aria-label="Logout"
            onClick={handleLogout}
            title="Logout"
            type="button"
          >
            <span aria-hidden="true">⇥</span>
          </button>
        )}
      </div>
    </header>
  )
}

export default DangerzoneHeader
