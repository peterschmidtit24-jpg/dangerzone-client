const fallbackBerlinCoordinates = [
  [52.5192, 13.4061],
  [52.5188, 13.4312],
  [52.5163, 13.3777],
  [52.5219, 13.4132],
  [52.5323, 13.4228],
  [52.5401, 13.4138],
  [52.5159, 13.4547],
  [52.4969, 13.4352],
  [52.5048, 13.3942],
]

function formatSeverity(severity) {
  if (!severity) {
    return "Low"
  }

  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
}

function getTimeAgo(dateValue) {
  if (!dateValue) {
    return "new"
  }

  const createdAt = new Date(dateValue)
  const elapsedMs = Date.now() - createdAt.getTime()
  const elapsedHours = Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60)))

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  return `${Math.floor(elapsedHours / 24)}d ago`
}

function getCoordinates(incident, index) {
  if (Number.isFinite(incident.lat) && Number.isFinite(incident.lng)) {
    return { lat: incident.lat, lng: incident.lng }
  }

  const fallback = fallbackBerlinCoordinates[index % fallbackBerlinCoordinates.length]
  return { lat: fallback[0], lng: fallback[1] }
}

export function mapServerIncidentToViewModel(incident, index) {
  const coordinates = getCoordinates(incident, index)

  return {
    id: incident._id,
    type: incident.incidentType,
    address: incident.location,
    timeAgo: getTimeAgo(incident.createdAt),
    severity: formatSeverity(incident.severity),
    comments: Array.isArray(incident.comments) ? incident.comments.length : 0,
    description: incident.description,
    active: incident.active,
    createdBy: incident.createdBy?.username || incident.createdBy?.email || "Unknown user",
    lat: coordinates.lat,
    lng: coordinates.lng,
  }
}
