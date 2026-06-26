import { incidentTypes } from "../../data/mockIncidents"
import IncidentListItem from "./IncidentListItem"

const radiusOptions = [1, 2, 5, 10, 25]

function IncidentSidebar({
  errorMessage,
  incidents,
  isLoading,
  onIncidentHover,
  onIncidentSelect,
  onNewIncident,
  onTypeChange,
  selectedType,
  totalIncidentCount,
}) {
  return (
    <aside className="incident-sidebar">
      <div className="sidebar-heading">
        <div>
          <h1>Active Incidents</h1>
          <p>{incidents.length} of {totalIncidentCount} in 5 km radius</p>
        </div>
        <button className="new-incident-button" onClick={onNewIncident} type="button">
          + New
        </button>
      </div>

      <label className="search-field">
        <span>Search</span>
        <input type="search" placeholder="Search by user..." />
      </label>

      <section className="filter-section">
        <h2>Radius</h2>
        <div className="radius-options">
          {radiusOptions.map((radius) => (
            <button
              className={radius === 5 ? "active" : ""}
              key={radius}
              type="button"
            >
              {radius}
            </button>
          ))}
        </div>
        <span className="radius-unit">km</span>
      </section>

      <section className="filter-section">
        <h2>Type</h2>
        <div className="type-options">
          <button
            className={selectedType === "all" ? "active" : ""}
            onClick={() => onTypeChange("all")}
            type="button"
          >
            All
          </button>
          {Object.entries(incidentTypes).map(([key, type]) => (
            <button
              className={selectedType === key ? "active" : ""}
              key={key}
              onClick={() => onTypeChange(key)}
              type="button"
            >
              {type.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </section>

      <div className="incident-list">
        {isLoading && <p className="incident-list-state">Loading data from server ...</p>}
        {!isLoading && errorMessage && (
          <p className="incident-list-state incident-list-error">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && incidents.length === 0 && (
          <p className="incident-list-state">No active incidents found.</p>
        )}
        {!isLoading && !errorMessage && incidents.map((incident) => (
          <IncidentListItem
            incident={incident}
            key={incident.id}
            onHover={onIncidentHover}
            onSelect={onIncidentSelect}
          />
        ))}
      </div>
    </aside>
  )
}

export default IncidentSidebar
