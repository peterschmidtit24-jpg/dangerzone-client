import { useCallback, useEffect, useState } from "react"
import DangerzoneHeader from "../components/map/DangerzoneHeader"
import IncidentCreateModal from "../components/map/IncidentCreateModal"
import IncidentDetailModal from "../components/map/IncidentDetailModal"
import PositionModal from "../components/map/PositionModal"
import IncidentSidebar from "../components/map/IncidentSidebar"
import MapCanvas from "../components/map/MapCanvas"
import { getAllIncidents, getIncident } from "../services/incident.service"
import "../styles/mapView.css"
import useUserPosition from "../hooks/useUserPosition"
import { getDistanceInKm } from "../utils/distance"
import { mapServerIncidentToViewModel } from "../utils/incidentMapper"

const radiusOptions = [1, 2, 5, 10, 25]

function MapViewPage() {
  const {
    requestUserPosition,
    setUserPositionFromAddress,
    setUserPositionFromIncident,
    userPosition,
  } = useUserPosition()
  const [incidents, setIncidents] = useState([])
  const [selectedType, setSelectedType] = useState("all")
  const [selectedRadius, setSelectedRadius] = useState(5)
  const [showRadiusOverlay, setShowRadiusOverlay] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [isIncidentLoading, setIsIncidentLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false)
  const [hoveredIncidentId, setHoveredIncidentId] = useState(null)

  const loadIncidents = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      setErrorMessage("")

      const response = await getAllIncidents()
      const mappedIncidents = response.data
        .filter((incident) => incident.active)
        .map(mapServerIncidentToViewModel)

      setIncidents(mappedIncidents)
    } catch (error) {
      console.error(error)
      setErrorMessage("Could not load incidents from the server.")
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadIncidents()
  }, [loadIncidents])

  async function handleIncidentSelect(incident) {
    try {
      setSelectedIncident(incident)
      setIsIncidentLoading(true)

      const response = await getIncident(incident.id)
      const mappedIncident = mapServerIncidentToViewModel(response.data)
      setSelectedIncident({
        ...mappedIncident,
        lat: Number.isFinite(response.data.lat) ? mappedIncident.lat : incident.lat,
        lng: Number.isFinite(response.data.lng) ? mappedIncident.lng : incident.lng,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsIncidentLoading(false)
    }
  }

  function handleIncidentChange(updatedIncident) {
    const mappedIncident = mapServerIncidentToViewModel(updatedIncident)
    const previousIncident = incidents.find((incident) => incident.id === mappedIncident.id)
    const incidentWithCoordinates = {
      ...mappedIncident,
      lat: Number.isFinite(updatedIncident.lat) ? mappedIncident.lat : previousIncident?.lat,
      lng: Number.isFinite(updatedIncident.lng) ? mappedIncident.lng : previousIncident?.lng,
    }

    setSelectedIncident(incidentWithCoordinates)
    setIncidents((currentIncidents) => currentIncidents.map((incident) => (
      incident.id === mappedIncident.id ? incidentWithCoordinates : incident
    )))
  }

  function handleIncidentDelete(incidentId) {
    setSelectedIncident(null)
    setIncidents((currentIncidents) => currentIncidents.filter((incident) => (
      incident.id !== incidentId
    )))
  }

  async function handleIncidentCreate(createdIncident, resolvedLocation) {
    const mappedIncident = mapServerIncidentToViewModel(createdIncident)
    const incidentWithCoordinates = {
      ...mappedIncident,
      lat: Number.isFinite(mappedIncident.lat) ? mappedIncident.lat : resolvedLocation?.lat,
      lng: Number.isFinite(mappedIncident.lng) ? mappedIncident.lng : resolvedLocation?.lng,
      address: mappedIncident.address || resolvedLocation?.location,
    }

    setSelectedType("all")
    const distanceInKm = getDistanceInKm(userPosition, incidentWithCoordinates)
    if (Number.isFinite(distanceInKm) && distanceInKm > selectedRadius) {
      const nextRadius = radiusOptions.find((radius) => distanceInKm <= radius)
      if (nextRadius) {
        setSelectedRadius(nextRadius)
      }
    }

    setIncidents((currentIncidents) => [incidentWithCoordinates, ...currentIncidents])
    setIsCreateModalOpen(false)
    setSelectedIncident(null)
    await loadIncidents({ showLoading: false })
  }

  const visibleIncidents = incidents.filter((incident) => {
    const typeMatches = selectedType === "all" || incident.type === selectedType
    const distanceInKm = getDistanceInKm(userPosition, incident)
    const radiusMatches = Number.isFinite(distanceInKm) && distanceInKm <= selectedRadius

    return typeMatches && radiusMatches
  })

  return (
    <div className="map-view-page">
      <DangerzoneHeader
        incidentCount={incidents.length}
        onSetPosition={() => setIsPositionModalOpen(true)}
      />
      <div className="map-view-shell">
        <IncidentSidebar
          errorMessage={errorMessage}
          incidents={visibleIncidents}
          isLoading={isLoading}
          onIncidentHover={setHoveredIncidentId}
          onIncidentSelect={handleIncidentSelect}
          onNewIncident={() => setIsCreateModalOpen(true)}
          onRadiusChange={setSelectedRadius}
          onShowRadiusOverlayChange={setShowRadiusOverlay}
          onTypeChange={setSelectedType}
          selectedRadius={selectedRadius}
          selectedType={selectedType}
          showRadiusOverlay={showRadiusOverlay}
          totalIncidentCount={incidents.length}
          userPosition={userPosition}
        />
        <MapCanvas
          highlightedIncidentId={hoveredIncidentId}
          incidents={visibleIncidents}
          onIncidentSelect={handleIncidentSelect}
          onReportIncident={() => setIsCreateModalOpen(true)}
          selectedRadius={selectedRadius}
          showRadiusOverlay={showRadiusOverlay}
          userPosition={userPosition}
        />
        {isLoading && (
          <div className="map-loading-overlay" role="status" aria-live="polite">
            <div className="map-loading-spinner" aria-hidden="true" />
            <p>Loading data from server ...</p>
          </div>
        )}
      </div>
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          isLoading={isIncidentLoading}
          onClose={() => setSelectedIncident(null)}
          onDelete={handleIncidentDelete}
          onIncidentChange={handleIncidentChange}
          onSetPosition={setUserPositionFromIncident}
        />
      )}
      {isCreateModalOpen && (
        <IncidentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onIncidentCreate={handleIncidentCreate}
        />
      )}
      {isPositionModalOpen && (
        <PositionModal
          currentPosition={userPosition}
          incidents={incidents}
          onClose={() => setIsPositionModalOpen(false)}
          onUseAddress={setUserPositionFromAddress}
          onUseCurrentPosition={requestUserPosition}
          onUseIncident={setUserPositionFromIncident}
        />
      )}
    </div>
  )
}

export default MapViewPage
