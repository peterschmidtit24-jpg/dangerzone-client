import { useState } from "react"
import { defaultUserPosition } from "../utils/distance"

function useUserPosition() {
  const [userPosition, setUserPosition] = useState(defaultUserPosition)
  const [positionError, setPositionError] = useState("")

  function requestUserPosition() {
    if (!navigator.geolocation) {
      const errorMessage = "Geolocation is not supported by this browser."
      setPositionError(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    setPositionError("")
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: "Your position",
          }

          setUserPosition(nextPosition)
          resolve(nextPosition)
        },
        () => {
          const errorMessage = "Could not read your current position."
          setPositionError(errorMessage)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          maximumAge: 60000,
          timeout: 10000,
        },
      )
    })
  }

  function setUserPositionFromIncident(incident) {
    if (!Number.isFinite(incident.lat) || !Number.isFinite(incident.lng)) {
      const errorMessage = "This incident has no valid position."
      setPositionError(errorMessage)
      throw new Error(errorMessage)
    }

    const nextPosition = {
      lat: incident.lat,
      lng: incident.lng,
      label: incident.address || "Incident position",
    }

    setPositionError("")
    setUserPosition(nextPosition)
    return nextPosition
  }

  async function setUserPositionFromAddress(address) {
    const trimmedAddress = address.trim()

    if (!trimmedAddress) {
      const errorMessage = "Enter an address first."
      setPositionError(errorMessage)
      throw new Error(errorMessage)
    }

    setPositionError("")

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmedAddress)}`,
    )

    if (!response.ok) {
      const errorMessage = "Could not search for this address."
      setPositionError(errorMessage)
      throw new Error(errorMessage)
    }

    const results = await response.json()
    const result = results[0]
    const lat = Number.parseFloat(result?.lat)
    const lng = Number.parseFloat(result?.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const errorMessage = "No position found for this address."
      setPositionError(errorMessage)
      throw new Error(errorMessage)
    }

    const nextPosition = {
      lat,
      lng,
      label: result.display_name || trimmedAddress,
    }

    setUserPosition(nextPosition)
    return nextPosition
  }

  return {
    positionError,
    requestUserPosition,
    setUserPositionFromAddress,
    setUserPositionFromIncident,
    userPosition,
  }
}

export default useUserPosition
