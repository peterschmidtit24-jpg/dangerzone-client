export const defaultUserPosition = {
  lat: 52.52,
  lng: 13.405,
  label: "Berlin",
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

export function getDistanceInKm(fromPosition, toPosition) {
  if (
    !fromPosition
    || !toPosition
    || !Number.isFinite(fromPosition.lat)
    || !Number.isFinite(fromPosition.lng)
    || !Number.isFinite(toPosition.lat)
    || !Number.isFinite(toPosition.lng)
  ) {
    return null
  }

  const earthRadiusInKm = 6371
  const latDistance = toRadians(toPosition.lat - fromPosition.lat)
  const lngDistance = toRadians(toPosition.lng - fromPosition.lng)
  const fromLat = toRadians(fromPosition.lat)
  const toLat = toRadians(toPosition.lat)

  const haversine =
    Math.sin(latDistance / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDistance / 2) ** 2

  return earthRadiusInKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function formatDistanceInKm(distanceInKm) {
  if (!Number.isFinite(distanceInKm)) {
    return "Distance unknown"
  }

  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m away`
  }

  return `${distanceInKm.toFixed(1)} km away`
}

export function getIncidentDistanceLabel(userPosition, incident) {
  return formatDistanceInKm(getDistanceInKm(userPosition, incident))
}
