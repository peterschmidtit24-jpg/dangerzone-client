import { useEffect, useState } from "react"
import DangerzoneHeader from "../components/map/DangerzoneHeader"
import IncidentCreateModal from "../components/map/IncidentCreateModal"
import IncidentDetailModal from "../components/map/IncidentDetailModal"
import IncidentSidebar from "../components/map/IncidentSidebar"
import MapCanvas from "../components/map/MapCanvas"
import { getAllIncidents, getIncident } from "../services/incident.service"
import "../styles/mapView.css"
import { mapServerIncidentToViewModel } from "../utils/incidentMapper"

function MapViewPage() {
  const [incidents, setIncidents] = useState([])
  const [selectedType, setSelectedType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [isIncidentLoading, setIsIncidentLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [hoveredIncidentId, setHoveredIncidentId] = useState(null)

  useEffect(() => {
    async function loadIncidents() {
      try {
        setIsLoading(true)
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
        setIsLoading(false)
      }
    }

    loadIncidents()
  }, [])

  async function handleIncidentSelect(incident) {
    try {
      setSelectedIncident(incident)
      setIsIncidentLoading(true)

      const response = await getIncident(incident.id)
      setSelectedIncident(mapServerIncidentToViewModel(response.data))
    } catch (error) {
      console.error(error)
    } finally {
      setIsIncidentLoading(false)
    }
  }

  function handleIncidentChange(updatedIncident) {
    const mappedIncident = mapServerIncidentToViewModel(updatedIncident)

    setSelectedIncident(mappedIncident)
    setIncidents((currentIncidents) => currentIncidents.map((incident) => (
      incident.id === mappedIncident.id ? mappedIncident : incident
    )))
  }

  function handleIncidentDelete(incidentId) {
    setSelectedIncident(null)
    setIncidents((currentIncidents) => currentIncidents.filter((incident) => (
      incident.id !== incidentId
    )))
  }

  function handleIncidentCreate(createdIncident) {
    const mappedIncident = mapServerIncidentToViewModel(createdIncident)

    setSelectedType("all")
    setIncidents((currentIncidents) => [mappedIncident, ...currentIncidents])
    setIsCreateModalOpen(false)
    setSelectedIncident(mappedIncident)
  }

  const visibleIncidents = selectedType === "all"
    ? incidents
    : incidents.filter((incident) => incident.type === selectedType)

  return (
    <div className="map-view-page">
      <DangerzoneHeader incidentCount={incidents.length} />
      <div className="map-view-shell">
        <IncidentSidebar
          errorMessage={errorMessage}
          incidents={visibleIncidents}
          isLoading={isLoading}
          onIncidentHover={setHoveredIncidentId}
          onIncidentSelect={handleIncidentSelect}
          onNewIncident={() => setIsCreateModalOpen(true)}
          onTypeChange={setSelectedType}
          selectedType={selectedType}
          totalIncidentCount={incidents.length}
        />
        <MapCanvas
          highlightedIncidentId={hoveredIncidentId}
          incidents={visibleIncidents}
          onIncidentSelect={handleIncidentSelect}
          onReportIncident={() => setIsCreateModalOpen(true)}
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
        />
      )}
      {isCreateModalOpen && (
        <IncidentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onIncidentCreate={handleIncidentCreate}
        />
      )}
    </div>
  )
}

export default MapViewPage
