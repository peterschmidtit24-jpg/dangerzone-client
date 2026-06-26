import service from "./service.config"

export function getAllIncidents() {
  return service.get("/all-incidents")
}
