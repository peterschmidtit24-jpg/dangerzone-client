import axios from "axios";

// this is a file where we organize all requests to our backend server
const service = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`
})

service.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authToken")
  if (authToken) {
    config.headers.authorization = `Bearer ${authToken}`
  }
  return config
})

export default service

//* examples of doing services as functions instead of passing service
// function createRecipe(body) {
//   return service.post("/recipes", body)
// }

// function examplePrivateRoute() {
//   return service.get("/example-of-private-route")
// }

// function signup(body) {
//   return service.get("/signup", body)
// }

// export default { createRecipe, examplePrivateRoute, signup }
