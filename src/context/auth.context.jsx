// import axios from "axios";
import service from "../services/service.config";
import { createContext, useEffect, useState } from "react";

// Context Component => the one that shares the states through the app
const AuthContext = createContext()

// Wrapper Component => the one that holds the global states and wraps the app
function AuthWrapper(props) {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedUserId, setLoggedUserId] = useState(null)

  //* extra for admin roles
  const [loggedUserRole, setLoggedUserRole] = useState(null)

  const [isAuthenticating, setIsAuthenticating] = useState(true)

  async function authenticateUser() {

    //... this function will verify the identity of the user and update the states accordingly

    const authToken = localStorage.getItem("authToken")
    if(!authToken) {
      setIsLoggedIn(false)
      setLoggedUserId(null)
      setIsAuthenticating(false)

      //* extra
      setLoggedUserRole(null)

      return
    }

    try {
      
      // const response = await axios.get("http://localhost:5005/api/auth/verify", {
      //   headers: {
      //     authorization: `Bearer ${authToken}`
      //   }
      // })
      const response = await service.get("/auth/verify") //! the token is passed in the service
      console.log(response)

      // if the request gets to this point it means the user token is correct
      setIsLoggedIn(true)
      setLoggedUserId(response.data._id)
      setIsAuthenticating(false)

      //* extra
      setLoggedUserRole(response.data.role)

    } catch (error) {
      console.log(error)
      // if the request gets here it means the user token is not valid or not provided.
      setIsLoggedIn(false)
      setLoggedUserId(null)
      setIsAuthenticating(false)

      //* extra
      setLoggedUserRole(null)
    }

  }

  const passedContext = { isLoggedIn, loggedUserId, authenticateUser }

  useEffect(() => {
    authenticateUser()
  }, []) // component did mount for the whole app

  if (isAuthenticating) {
    return <h3>... authenticating user</h3>
  }

  return (
    <AuthContext.Provider value={passedContext}>
      {props.children}
    </AuthContext.Provider>
  )
}

export {
  AuthContext,
  AuthWrapper
}