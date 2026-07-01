import { useContext, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/auth.context"
import { incidentTypes } from "../../data/mockIncidents"
import { createIncident } from "../../services/incident.service"
import { resolveAddress } from "../../utils/geocode"

const initialFormValues = {
  incidentType: "pothole",
  location: "",
  severity: "medium",
  probableDuration: "hours",
  description: "",
}

function IncidentCreateModal({ onClose, onIncidentCreate }) {
  const { isLoggedIn } = useContext(AuthContext)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingLocationMatch, setPendingLocationMatch] = useState(null)

  const selectedType = incidentTypes[formValues.incidentType] || incidentTypes.other

  function updateField(fieldName, value) {
    setPendingLocationMatch(null)
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))
  }

  async function createIncidentWithLocation(values, coordinates, location) {
    const response = await createIncident({
      ...values,
      location,
      lat: coordinates.lat,
      lng: coordinates.lng,
      description: values.description.trim(),
      active: true,
    })

    onIncidentCreate(response.data)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isLoggedIn) {
      setErrorMessage("You need to log in before creating an incident.")
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")
      const location = formValues.location.trim()
      const coordinates = await resolveAddress(location)

      if (coordinates.matchType !== "exact") {
        setPendingLocationMatch({
          coordinates,
          requestedLocation: location,
          values: { ...formValues },
        })
        return
      }

      await createIncidentWithLocation(formValues, coordinates, location)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.response?.data?.errorMessage || error.message || "Could not create incident.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUseSuggestedLocation() {
    if (!pendingLocationMatch) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")
      await createIncidentWithLocation(
        pendingLocationMatch.values,
        pendingLocationMatch.coordinates,
        pendingLocationMatch.coordinates.query,
      )
    } catch (error) {
      console.error(error)
      setErrorMessage(error.response?.data?.errorMessage || error.message || "Could not create incident.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="incident-modal-backdrop" onClick={onClose}>
      <section
        aria-label="Create incident"
        className="incident-modal incident-create-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="incident-modal-header">
          <div
            className="incident-modal-icon"
            style={{ "--incident-color": selectedType.color }}
            aria-hidden="true"
          >
            {selectedType.icon}
          </div>
          <div>
            <h2 style={{ color: selectedType.color }}>New Incident</h2>
            <p>Register a live city incident</p>
          </div>
          <button className="incident-modal-close" onClick={onClose} type="button">
            x
          </button>
        </header>

        {!isLoggedIn ? (
          <div className="incident-create-auth">
            <p>You need to be signed in to create your own incident.</p>
            <Link to="/login">Sign In</Link>
          </div>
        ) : (
          <form className="incident-create-form" onSubmit={handleSubmit}>
            <div className="incident-edit-row">
              <label>
                <span>Type</span>
                <select
                  value={formValues.incidentType}
                  onChange={(event) => updateField("incidentType", event.target.value)}
                >
                  {Object.entries(incidentTypes).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Severity</span>
                <select
                  value={formValues.severity}
                  onChange={(event) => updateField("severity", event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>

            <label>
              <span>Location</span>
              <input
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Street, district"
                required
                type="text"
                value={formValues.location}
              />
            </label>

            <label>
              <span>Probable Duration</span>
              <select
                value={formValues.probableDuration}
                onChange={(event) => updateField("probableDuration", event.target.value)}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </label>

            <label>
              <span>Description</span>
              <textarea
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Describe what happened..."
                required
                value={formValues.description}
              />
            </label>

            <div className="incident-owner-actions incident-create-actions">
              <button disabled={isSubmitting} type="submit">Create Incident</button>
              <button className="secondary" onClick={onClose} type="button">
                Cancel
              </button>
            </div>

            {errorMessage && <p className="incident-modal-error">{errorMessage}</p>}

            {pendingLocationMatch && (
              <section className="incident-location-warning" role="alert">
                <h3>Location needs confirmation</h3>
                <p>
                  We could not verify the exact address
                  {" "}
                  <strong>{pendingLocationMatch.requestedLocation}</strong>.
                </p>
                <p>
                  The closest usable map position is
                  {" "}
                  <strong>{pendingLocationMatch.coordinates.query}</strong>.
                </p>
                <div>
                  <button
                    disabled={isSubmitting}
                    onClick={handleUseSuggestedLocation}
                    type="button"
                  >
                    Use Suggested Location
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => setPendingLocationMatch(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            )}
          </form>
        )}
      </section>
    </div>
  )
}

export default IncidentCreateModal
