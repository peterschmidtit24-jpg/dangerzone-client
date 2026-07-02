import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/auth.context"
import { incidentTypes } from "../../data/mockIncidents"
import {
  createIncidentComment,
  deleteIncident,
  updateIncident,
} from "../../services/incident.service"
import { geocodeAddress } from "../../utils/geocode"

function IncidentDetailModal({
  incident,
  isLoading,
  onClose,
  onDelete,
  onIncidentChange,
  onSetPosition,
}) {
  const { isLoggedIn, loggedUserId, loggedUserRole } = useContext(AuthContext)
  const [commentText, setCommentText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [formValues, setFormValues] = useState({
    location: incident.address || "",
    description: incident.description || "",
    severity: incident.severityValue || "low",
    probableDuration: incident.duration || "hours",
    active: incident.active,
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const type = incidentTypes[incident.type] || incidentTypes.other
  const isOwner = incident.createdById === loggedUserId
  const isAdmin = loggedUserRole === "admin"
  const canDeleteIncident = isOwner || isAdmin

  useEffect(() => {
    setFormValues({
      location: incident.address || "",
      description: incident.description || "",
      severity: incident.severityValue || "low",
      probableDuration: incident.duration || "hours",
      active: incident.active,
    })
    setIsEditing(false)
    setErrorMessage("")
  }, [incident])

  async function handleCommentSubmit(event) {
    event.preventDefault()

    if (!commentText.trim()) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const response = await createIncidentComment(incident.id, {
        comment: commentText.trim(),
        flag: "normal",
      })

      setCommentText("")
      onIncidentChange(response.data)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.response?.data?.errorMessage || "Could not post comment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage("")
      const nextLocation = formValues.location.trim()
      const locationChanged = nextLocation !== incident.address
      const nextCoordinates = locationChanged
        ? await geocodeAddress(nextLocation)
        : { lat: incident.lat, lng: incident.lng }

      const response = await updateIncident(incident.id, {
        incidentType: incident.type,
        location: nextLocation,
        lat: nextCoordinates.lat,
        lng: nextCoordinates.lng,
        severity: formValues.severity,
        probableDuration: formValues.probableDuration,
        description: formValues.description,
        active: formValues.active,
      })

      onIncidentChange(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.response?.data?.errorMessage || "Could not update incident.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      setIsSubmitting(true)
      setErrorMessage("")

      await deleteIncident(incident.id)
      onDelete(incident.id)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.response?.data?.errorMessage || "Could not delete incident.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="incident-modal-backdrop" onClick={onClose}>
      <section
        aria-label="Incident details"
        className="incident-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="incident-modal-header">
          <div
            className="incident-modal-icon"
            style={{ "--incident-color": type.color }}
            aria-hidden="true"
          >
            {type.icon}
          </div>
          <div>
            <h2 style={{ color: type.color }}>{type.label}</h2>
            <p>{incident.address}</p>
          </div>
          {onSetPosition && (
            <button
              className="incident-position-button"
              onClick={() => onSetPosition(incident)}
              type="button"
            >
              Set Position Here
            </button>
          )}
          <button className="incident-modal-close" onClick={onClose} type="button">
            x
          </button>
        </header>

        {isLoading && <p className="incident-modal-state">Loading latest incident data...</p>}

        <div className="incident-modal-grid">
          <div>
            <span>Severity</span>
            <strong style={{ color: type.color }}>{incident.severity}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{incident.duration}</strong>
          </div>
          <div>
            <span>Reported</span>
            <strong>{incident.reportedAtLabel}</strong>
          </div>
          <div>
            <span>Reporter</span>
            <strong>{incident.createdBy}</strong>
          </div>
        </div>

        {!isEditing ? (
          <section className="incident-modal-description">
            <h3>Description</h3>
            <p>{incident.description}</p>
          </section>
        ) : (
          <form className="incident-edit-form" onSubmit={handleUpdateSubmit}>
            <label>
              <span>Street / Address</span>
              <input
                onChange={(event) => setFormValues({
                  ...formValues,
                  location: event.target.value,
                })}
                placeholder="Street, house number, city"
                required
                type="text"
                value={formValues.location}
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                value={formValues.description}
                onChange={(event) => setFormValues({
                  ...formValues,
                  description: event.target.value,
                })}
                required
              />
            </label>

            <div className="incident-edit-row">
              <label>
                <span>Severity</span>
                <select
                  value={formValues.severity}
                  onChange={(event) => setFormValues({
                    ...formValues,
                    severity: event.target.value,
                  })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                <span>Duration</span>
                <select
                  value={formValues.probableDuration}
                  onChange={(event) => setFormValues({
                    ...formValues,
                    probableDuration: event.target.value,
                  })}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </label>
            </div>

            <label className="incident-active-toggle">
              <input
                checked={formValues.active}
                onChange={(event) => setFormValues({
                  ...formValues,
                  active: event.target.checked,
                })}
                type="checkbox"
              />
              <span>Incident is active</span>
            </label>

            <div className="incident-owner-actions">
              <button disabled={isSubmitting} type="submit">Save Incident</button>
              <button
                className="secondary"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {canDeleteIncident && !isEditing && (
          <div className="incident-owner-actions">
            {isOwner && (
              <button onClick={() => setIsEditing(true)} type="button">Edit Incident</button>
            )}
            <button
              className="danger"
              disabled={isSubmitting}
              onClick={handleDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        )}

        <section className="incident-comments">
          <h3>Comments ({incident.commentItems.length})</h3>

          {incident.commentItems.length === 0 ? (
            <p className="incident-empty-comments">No comments yet.</p>
          ) : (
            <div className="incident-comment-list">
              {incident.commentItems.map((comment) => (
                <article className="incident-comment" key={comment.id}>
                  <div>
                    <strong>{comment.userName}</strong>
                    <span>{comment.createdAtLabel}</span>
                  </div>
                  <p>{comment.text}</p>
                </article>
              ))}
            </div>
          )}

          {isLoggedIn ? (
            <form className="incident-comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                value={commentText}
              />
              <button disabled={isSubmitting || !commentText.trim()} type="submit">
                Post
              </button>
            </form>
          ) : (
            <p className="incident-modal-state">
              <Link to="/login">Sign in</Link>
              {" "}
              or
              {" "}
              <Link to="/signup">register</Link>
              {" "}
              to comment on this incident.
            </p>
          )}
        </section>

        {errorMessage && <p className="incident-modal-error">{errorMessage}</p>}
      </section>
    </div>
  )
}

export default IncidentDetailModal
