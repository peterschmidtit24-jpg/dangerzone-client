import { useMemo, useState } from "react"

function formatCoordinate(value, directionPositive, directionNegative) {
  const direction = value >= 0 ? directionPositive : directionNegative
  return `${Math.abs(value).toFixed(4)}${direction}`
}

function formatIncidentPosition(incident) {
  if (!Number.isFinite(incident.lat) || !Number.isFinite(incident.lng)) {
    return "No coordinates"
  }

  return `${formatCoordinate(incident.lat, "N", "S")}, ${formatCoordinate(incident.lng, "E", "W")}`
}

function PositionModal({
  currentPosition,
  incidents,
  onClose,
  onUseAddress,
  onUseCurrentPosition,
  onUseIncident,
}) {
  const [address, setAddress] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectableIncidents = useMemo(() => (
    incidents.filter((incident) => (
      Number.isFinite(incident.lat) && Number.isFinite(incident.lng)
    ))
  ), [incidents])

  async function runPositionAction(action) {
    try {
      setIsSubmitting(true)
      setErrorMessage("")
      await action()
      onClose()
    } catch (error) {
      setErrorMessage(error.message || "Could not update position.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleAddressSubmit(event) {
    event.preventDefault()
    runPositionAction(() => onUseAddress(address))
  }

  return (
    <div className="incident-modal-backdrop" onClick={onClose}>
      <section
        aria-label="Set my position"
        className="position-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="position-modal-header">
          <div>
            <h2>My Position</h2>
            <p>
              {formatCoordinate(currentPosition.lat, "N", "S")}, {" "}
              {formatCoordinate(currentPosition.lng, "E", "W")}
            </p>
          </div>
          <button className="incident-modal-close" onClick={onClose} type="button">
            x
          </button>
        </header>

        <div className="position-modal-body">
          <button
            className="position-gps-button"
            disabled={isSubmitting}
            onClick={() => runPositionAction(onUseCurrentPosition)}
            type="button"
          >
            <span>GPS Fix</span>
            <strong>Use Current Browser Position</strong>
          </button>

          <form className="position-address-form" onSubmit={handleAddressSubmit}>
            <label>
              <span>Street & City</span>
              <input
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Kurfurstendamm 21, Berlin"
                type="text"
                value={address}
              />
            </label>
            <button disabled={isSubmitting || !address.trim()} type="submit">
              Save Address Position
            </button>
          </form>

          <section className="position-quick-select">
            <h3>Quick Select Incident</h3>
            {selectableIncidents.length === 0 ? (
              <p>No incidents with coordinates available.</p>
            ) : (
              <div className="position-incident-list">
                {selectableIncidents.map((incident) => (
                  <button
                    disabled={isSubmitting}
                    key={incident.id}
                    onClick={() => runPositionAction(() => onUseIncident(incident))}
                    type="button"
                  >
                    <span>{incident.address}</span>
                    <strong>{formatIncidentPosition(incident)}</strong>
                  </button>
                ))}
              </div>
            )}
          </section>

          {errorMessage && <p className="incident-modal-error">{errorMessage}</p>}
        </div>
      </section>
    </div>
  )
}

export default PositionModal
