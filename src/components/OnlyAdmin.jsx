import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/auth.context"

function OnlyAdmin({ children }) {
  const { isLoggedIn, loggedUserRole } = useContext(AuthContext)

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  if (loggedUserRole !== "admin") {
    return <Navigate to="/" />
  }

  return children
}

export default OnlyAdmin
