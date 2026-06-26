import service from "./service.config"

export function getAllIncidents() {
  return service.get("/all-incidents")
}

export function getIncident(incidentId) {
  return service.get(`/incident/${incidentId}`)
}

export function createIncident(body) {
  return service.post("/incident", body)
}

export function createIncidentComment(incidentId, body) {
  return service.post(`/comment/incident/${incidentId}`, body)
}

export function updateIncident(incidentId, body) {
  return service.put(`/incident/${incidentId}`, body)
}

export function deleteIncident(incidentId) {
  return service.delete(`/incident/${incidentId}`)
}
