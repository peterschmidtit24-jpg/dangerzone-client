import { useState } from "react"
import { defaultUserPosition } from "../utils/distance"

function useUserPosition() {
  const [userPosition, setUserPosition] = useState(defaultUserPosition)
  const [positionError, setPositionError] = useState("")

  function requestUserPosition() {
    if (!navigator.geolocation) {
      setPositionError("Geolocation is not supported by this browser.")
      return
    }

    setPositionError("")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your position",
        })
      },
      () => {
        setPositionError("Could not read your current position.")
        setUserPosition(defaultUserPosition)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      },
    )
  }

  function setUserPositionFromIncident(incident) {
    if (!Number.isFinite(incident.lat) || !Number.isFinite(incident.lng)) {
      setPositionError("This incident has no valid position.")
      return
    }

    setPositionError("")
    setUserPosition({
      lat: incident.lat,
      lng: incident.lng,
      label: incident.address || "Incident position",
    })
  }

  return {
    positionError,
    requestUserPosition,
    setUserPositionFromIncident,
    userPosition,
  }
}

export default useUserPosition
