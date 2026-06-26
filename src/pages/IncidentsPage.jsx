import { useEffect, useMemo, useState } from "react"
import DangerzoneHeader from "../components/map/DangerzoneHeader"
import IncidentDetailModal from "../components/map/IncidentDetailModal"
import { incidentTypes } from "../data/mockIncidents"
import { getAllIncidents, getIncident } from "../services/incident.service"
import "../styles/mapView.css"
import { mapServerIncidentToViewModel } from "../utils/incidentMapper"

function IncidentsPage() {
  const [incidents, setIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isIncidentLoading, setIsIncidentLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return incidents.filter((incident) => {
      const typeMatches = selectedType === "all" || incident.type === selectedType
      const searchMatches = !normalizedSearch
        || incident.createdBy.toLowerCase().includes(normalizedSearch)
        || incident.address.toLowerCase().includes(normalizedSearch)
        || incident.description.toLowerCase().includes(normalizedSearch)

      return typeMatches && searchMatches
    })
  }, [incidents, searchTerm, selectedType])

  return (
    <div className="map-view-page incidents-page">
      <DangerzoneHeader incidentCount={incidents.length} />

      <main className="incidents-page-shell">
        <div className="incidents-toolbar">
          <label className="incidents-search">
            <span>Filter incidents</span>
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by reporter, address, description..."
              type="search"
              value={searchTerm}
            />
          </label>

          <div className="incidents-filter-buttons" aria-label="Filter by incident type">
            <button
              className={selectedType === "all" ? "active" : ""}
              onClick={() => setSelectedType("all")}
              type="button"
            >
              All Types
            </button>
            {Object.entries(incidentTypes).map(([key, type]) => (
              <button
                className={selectedType === key ? "active" : ""}
                key={key}
                onClick={() => setSelectedType(key)}
                type="button"
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="incidents-page-meta">
          <span>{filteredIncidents.length}</span> incidents in 5 km radius
        </div>

        {isLoading && (
          <div className="incidents-loading" role="status" aria-live="polite">
            <div className="map-loading-spinner" aria-hidden="true" />
            <p>Loading data from server ...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <p className="incident-list-state incident-list-error">{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && filteredIncidents.length === 0 && (
          <p className="incident-list-state">No active incidents found.</p>
        )}

        {!isLoading && !errorMessage && filteredIncidents.length > 0 && (
          <section className="incident-card-grid" aria-label="Incident cards">
            {filteredIncidents.map((incident) => {
              const type = incidentTypes[incident.type]

              return (
                <article
                  className="incident-card"
                  key={incident.id}
                  onClick={() => handleIncidentSelect(incident)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleIncidentSelect(incident)
                    }
                  }}
                  role="button"
                  style={{ "--incident-color": type.color }}
                  tabIndex={0}
                >
                  <div className="incident-card-header">
                    <div>
                      <h2>{type.label}</h2>
                      <strong>{incident.address}</strong>
                    </div>
                    <span className="incident-card-dot" />
                  </div>

                  <p>{incident.description}</p>

                  <div className="incident-card-footer">
                    <span>{incident.reportedAtLabel}</span>
                    <span>by {incident.createdBy}</span>
                    <span>{incident.comments} comments</span>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </main>

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          isLoading={isIncidentLoading}
          onClose={() => setSelectedIncident(null)}
          onDelete={handleIncidentDelete}
          onIncidentChange={handleIncidentChange}
        />
      )}
    </div>
  )
}

export default IncidentsPage
