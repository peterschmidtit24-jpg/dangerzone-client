import { useEffect, useState } from "react"
import DangerzoneHeader from "../components/map/DangerzoneHeader"
import IncidentSidebar from "../components/map/IncidentSidebar"
import MapCanvas from "../components/map/MapCanvas"
import { getAllIncidents } from "../services/incident.service"
import "../styles/mapView.css"
import { mapServerIncidentToViewModel } from "../utils/incidentMapper"

function MapViewPage() {
  const [incidents, setIncidents] = useState([])
  const [selectedType, setSelectedType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

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
          onTypeChange={setSelectedType}
          selectedType={selectedType}
          totalIncidentCount={incidents.length}
        />
        <MapCanvas incidents={visibleIncidents} />
      </div>
    </div>
  )
}

export default MapViewPage
