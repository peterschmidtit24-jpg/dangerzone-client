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

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Unknown"
  }

  const date = new Date(dateValue)
  const day = String(date.getDate()).padStart(2, "0")
  const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}. ${monthNames[date.getMonth()]}, ${hours}:${minutes}`
}

function mapComment(comment) {
  if (!comment || typeof comment !== "object") {
    return {
      id: comment,
      text: "",
      flag: "normal",
      createdAt: null,
      createdAtLabel: "Unknown",
      userId: null,
      userName: "Unknown user",
    }
  }

  return {
    id: comment._id,
    text: comment.comment,
    flag: comment.flag,
    createdAt: comment.createdAt,
    createdAtLabel: formatDateTime(comment.createdAt),
    userId: comment.user?._id,
    userName: comment.user?.username || comment.user?.email || "Unknown user",
  }
}

function getCoordinates(incident, index) {
  if (Number.isFinite(incident.lat) && Number.isFinite(incident.lng)) {
    return { lat: incident.lat, lng: incident.lng }
  }

  const idSeed = String(incident._id || incident.location || "")
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0)
  const fallbackIndex = Number.isInteger(index) ? index : idSeed
  const fallback = fallbackBerlinCoordinates[fallbackIndex % fallbackBerlinCoordinates.length]
  return { lat: fallback[0], lng: fallback[1] }
}

export function mapServerIncidentToViewModel(incident, index) {
  const coordinates = getCoordinates(incident, index)
  const comments = Array.isArray(incident.comments)
    ? incident.comments.map(mapComment)
    : []

  return {
    id: incident._id,
    type: incident.incidentType,
    address: incident.location,
    timeAgo: getTimeAgo(incident.createdAt),
    reportedAt: incident.createdAt,
    reportedAtLabel: formatDateTime(incident.createdAt),
    severity: formatSeverity(incident.severity),
    severityValue: incident.severity,
    duration: incident.probableDuration,
    comments: comments.length,
    commentItems: comments,
    description: incident.description,
    active: incident.active,
    createdBy: incident.createdBy?.username || incident.createdBy?.email || "Unknown user",
    createdById: incident.createdBy?._id,
    lat: coordinates.lat,
    lng: coordinates.lng,
  }
}
