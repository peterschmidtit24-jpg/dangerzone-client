import { incidentTypes } from "../../data/mockIncidents"

import L from "leaflet"
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

function createIncidentIcon(type, isHighlighted) {
  return L.divIcon({
    className: "dangerzone-marker",
    html: `
      <div class="dangerzone-marker-inner${isHighlighted ? " dangerzone-marker-inner-active" : ""}" style="--incident-color: ${type.color}">
        <span class="dangerzone-marker-symbol">${type.icon}</span>
        <span class="dangerzone-marker-label">${type.label}</span>
      </div>
    `,
    iconAnchor: [65, 60],
    iconSize: [130, 70],
    popupAnchor: [0, -58],
  })
}

function MapCanvas({
  highlightedIncidentId,
  incidents,
  onIncidentSelect,
  onReportIncident,
  selectedRadius,
  showRadiusOverlay,
  userPosition,
}) {
  // guard for coordinate values
  const incidentsWithCoordinates = incidents.filter(
    (incident) => Number.isFinite(incident.lat) && Number.isFinite(incident.lng),
  )

  return (
    <main className="map-canvas" aria-label="Incident map">

      <MapContainer
        center={[userPosition.lat, userPosition.lng]}
        key={`${userPosition.lat}-${userPosition.lng}`}
        zoom={13}
        className="leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showRadiusOverlay && (
          <Circle
            center={[userPosition.lat, userPosition.lng]}
            pathOptions={{
              color: "#ff2b1f",
              fillColor: "#ff2b1f",
              fillOpacity: 0.16,
              opacity: 0.7,
              weight: 2,
            }}
            radius={selectedRadius * 1000}
          />
        )}

        {incidentsWithCoordinates.map((incident) => {
          const type = incidentTypes[incident.type] || incidentTypes.other
          const isHighlighted = incident.id === highlightedIncidentId

          return (
            <Marker
              eventHandlers={{
                click: () => onIncidentSelect(incident),
              }}
              icon={createIncidentIcon(type, isHighlighted)}
              key={incident.id}
              position={[incident.lat, incident.lng]}
            >
              <Popup>
                <strong>{type.label}</strong>
                <br />
                {incident.address}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
            
      <div className="map-location-badge">
        {userPosition.label} - {userPosition.lat.toFixed(2)}N / {userPosition.lng.toFixed(2)}E
      </div>

      <div className="map-scale">
        <span />
        1 KM
      </div>

      {/* floating buttons */}
      <button
        className="report-incident-button"
        onClick={onReportIncident}
        type="button"
      >
        + Report Incident
      </button>
      <button className="help-button" type="button" aria-label="Help">
        ?
      </button>
    </main>
  )
}

export default MapCanvas
