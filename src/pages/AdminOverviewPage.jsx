import { useCallback, useEffect, useMemo, useState } from "react"
import DangerzoneHeader from "../components/map/DangerzoneHeader"
import PositionModal from "../components/map/PositionModal"
import useUserPosition from "../hooks/useUserPosition"
import { incidentTypes } from "../data/mockIncidents"
import { getAllUsers, getAllComments, deleteComment } from "../services/admin.service"
import { deleteIncident, getAllIncidents } from "../services/incident.service"
import { mapServerIncidentToViewModel } from "../utils/incidentMapper"
import "../styles/admin.css"

const localUserSignals = {
  warned: 2,
  banned: 1,
}

const userSignalByEmail = {
  "lena@dangerzone.app": { status: "warned", flags: 2 },
  "kai@dangerzone.app": { status: "warned", flags: 4 },
  "zara@dangerzone.app": { status: "banned", flags: 6 },
}

const moderationFallback = [
  {
    id: "fallback-incident-fire",
    kind: "incident",
    accent: "#ffd42a",
    type: "fire",
    author: "Kai Hoffmann",
    status: "warned",
    text: "THIS IS TOTAL FAKE REPORT TO CAUSE PANIC - NOTHING IS HERE",
  },
  {
    id: "fallback-incident-crime",
    kind: "incident",
    accent: "#ffd42a",
    type: "crime",
    author: "Zara Nowak",
    status: "banned",
    text: "FAKE POLICE ACTIVITY - DO NOT CALL COPS THEY ARE CORRUPT",
  },
  {
    id: "fallback-comment",
    kind: "comment",
    accent: "#ff6a2a",
    author: "Kai Hoffmann",
    context: "on Hauptstrasse 42",
    text: "YOU IDIOTS WHY IS THIS NOT FIXED YET!!! USELESS CITY!!!",
  },
]

const activityFallback = [
  { id: 1, time: "09:14", color: "#ffd42a", text: "Incident i10 flagged as toxic by system filter." },
  { id: 2, time: "08:52", color: "#ffd42a", text: "Incident i11 flagged as toxic by system filter." },
  { id: 3, time: "07:30", color: "#ff2b1f", text: "User Zara Nowak banned after 3rd offence." },
  { id: 4, time: "06:10", color: "#ff6a2a", text: "Comment c2 flagged for review - aggressive language." },
]

const flaggedIncidentFallback = [
  {
    id: "fallback-warschauer",
    type: "fire",
    address: "Warschauer Strasse 55, Kreuzberg",
    createdBy: "Kai Hoffmann",
    timeAgo: "6d ago",
    severity: "High",
    flagged: true,
  },
  {
    id: "fallback-kurfuerstendamm",
    type: "crime",
    address: "Kurfuerstendamm 12, Charlottenburg",
    createdBy: "Zara Nowak",
    timeAgo: "7d ago",
    severity: "High",
    flagged: true,
  },
]

function formatTime(dateValue) {
  if (!dateValue) {
    return "--:--"
  }

  const date = new Date(dateValue)
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${hours}:${minutes}`
}

function getCommentUser(comment) {
  return comment.user?.username || comment.user?.email || "Unknown user"
}

function formatSince(dateValue) {
  if (!dateValue) {
    return "since --"
  }

  const date = new Date(dateValue)
  const day = String(date.getDate()).padStart(2, "0")
  const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
  const year = String(date.getFullYear()).slice(-2)

  return `since ${day}. ${monthNames[date.getMonth()]} ${year}`
}

function formatAge(dateValue) {
  if (!dateValue) {
    return "new"
  }

  const elapsedMs = Date.now() - new Date(dateValue).getTime()
  const elapsedHours = Math.max(1, Math.floor(elapsedMs / (1000 * 60 * 60)))

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }

  return `${Math.floor(elapsedHours / 24)}d ago`
}

function getUserDisplayName(user) {
  return user.username || user.email || "Unknown user"
}

function getUserInitials(user) {
  const name = getUserDisplayName(user)
  const parts = name.trim().split(/\s+/)

  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return name.slice(0, 2).toUpperCase()
}

function AdminOverviewPage() {
  const {
    requestUserPosition,
    setUserPositionFromAddress,
    setUserPositionFromIncident,
    userPosition,
  } = useUserPosition()
  const [incidents, setIncidents] = useState([])
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [activeAdminTab, setActiveAdminTab] = useState("overview")
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [incidentSearchTerm, setIncidentSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingIncident, setIsDeletingIncident] = useState(false)
  const [isDeletingComment, setIsDeletingComment] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false)
  const [pendingIncidentDelete, setPendingIncidentDelete] = useState(null)
  const [pendingCommentDelete, setPendingCommentDelete] = useState(null)

  useEffect(() => {
    async function loadAdminOverview() {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const [incidentsResponse, usersResponse, commentsResponse] = await Promise.all([
          getAllIncidents(),
          getAllUsers(),
          getAllComments(),
        ])

        setIncidents(incidentsResponse.data.map((incident, index) => mapServerIncidentToViewModel(incident, index)))
        setUsers(usersResponse.data)
        setComments(commentsResponse.data)
      } catch (error) {
        console.error(error)
        setErrorMessage("Could not load admin overview data.")
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminOverview()
  }, [])

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments((currentComments) => currentComments.filter((comment) => comment._id !== commentId))
      setIncidents((currentIncidents) => currentIncidents.map((incident) => ({
        ...incident,
        commentItems: incident.commentItems.filter((comment) => comment.id !== commentId),
        comments: incident.commentItems.filter((comment) => comment.id !== commentId).length,
      })))
    } catch (error) {
      console.error(error)
      setErrorMessage("Could not delete this comment.")
    }
  }, [])

  const handleConfirmDeleteIncident = useCallback(async () => {
    if (!pendingIncidentDelete?.onDelete) {
      setPendingIncidentDelete(null)
      return
    }

    try {
      setIsDeletingIncident(true)
      await pendingIncidentDelete.onDelete()
      setPendingIncidentDelete(null)
    } catch (error) {
      console.error(error)
      setErrorMessage("Could not delete this incident.")
    } finally {
      setIsDeletingIncident(false)
    }
  }, [pendingIncidentDelete])

  const handleConfirmDeleteComment = useCallback(async () => {
    if (!pendingCommentDelete) {
      return
    }

    try {
      setIsDeletingComment(true)
      await handleDeleteComment(pendingCommentDelete.id)
      setPendingCommentDelete(null)
    } catch (error) {
      console.error(error)
      setErrorMessage("Could not delete this comment.")
    } finally {
      setIsDeletingComment(false)
    }
  }, [handleDeleteComment, pendingCommentDelete])

  const activeIncidents = incidents.filter((incident) => incident.active)
  const highSeverityIncidents = activeIncidents.filter((incident) => (
    incident.severityValue === "high" || incident.severity === "High"
  ))
  const flaggedComments = comments.filter((comment) => comment.flag && comment.flag !== "normal")
  const normalizedUserSearch = userSearchTerm.trim().toLowerCase()
  const normalizedIncidentSearch = incidentSearchTerm.trim().toLowerCase()

  const moderationItems = useMemo(() => {
    const liveFlaggedComments = flaggedComments.map((comment) => {
      const relatedIncident = incidents.find((incident) => (
        incident.commentItems.some((item) => item.id === comment._id)
      ))

      return {
        id: comment._id,
        kind: "comment",
        accent: "#ff6a2a",
        author: getCommentUser(comment),
        context: relatedIncident ? `on ${relatedIncident.address}` : "flagged comment",
        flag: comment.flag,
        text: comment.comment,
        onDelete: () => handleDeleteComment(comment._id),
      }
    })

    return [...liveFlaggedComments, ...moderationFallback].slice(0, 5)
  }, [flaggedComments, handleDeleteComment, incidents])

  const activityItems = useMemo(() => {
    const commentActivity = flaggedComments.map((comment) => ({
      id: comment._id,
      time: formatTime(comment.updatedAt || comment.createdAt),
      color: comment.flag === "toxic" ? "#ff2b1f" : "#ffd42a",
      text: `Comment ${comment._id.slice(-4)} flagged as ${comment.flag}.`,
    }))

    const incidentActivity = highSeverityIncidents.slice(0, 2).map((incident) => ({
      id: incident.id,
      time: formatTime(incident.reportedAt),
      color: "#ffd42a",
      text: `Incident ${incident.id.slice(-4)} marked high severity.`,
    }))

    return [...commentActivity, ...incidentActivity, ...activityFallback].slice(0, 6)
  }, [flaggedComments, highSeverityIncidents])

  const statCards = [
    { id: "active", icon: "~", value: activeIncidents.length, label: "Active Incidents", color: "#46a7ff" },
    { id: "flagged-incidents", icon: "F", value: highSeverityIncidents.length, label: "Flagged Incidents", color: "#ffd42a" },
    { id: "users", icon: "U", value: users.length, label: "Total Users", color: "#43d49a" },
    { id: "warned", icon: "!", value: localUserSignals.warned, label: "Warned Users", color: "#ffd42a" },
    { id: "banned", icon: "X", value: localUserSignals.banned, label: "Banned Users", color: "#ff2b1f" },
    { id: "comments", icon: "C", value: flaggedComments.length, label: "Flagged Comments", color: "#ff6a2a" },
  ]

  const userRows = useMemo(() => {
    return users
      .map((user) => {
        const reports = incidents.filter((incident) => incident.createdById === user._id).length
        const commentCount = comments.filter((comment) => comment.user?._id === user._id).length
        const signal = userSignalByEmail[user.email] || {}
        const status = user.role === "admin" ? "admin" : signal.status || "active"

        return {
          ...user,
          commentCount,
          flags: signal.flags || 0,
          reports,
          status,
        }
      })
      .filter((user) => {
        if (!normalizedUserSearch) {
          return true
        }

        return getUserDisplayName(user).toLowerCase().includes(normalizedUserSearch)
          || user.email.toLowerCase().includes(normalizedUserSearch)
      })
      .sort((firstUser, secondUser) => getUserDisplayName(firstUser).localeCompare(getUserDisplayName(secondUser)))
  }, [comments, incidents, normalizedUserSearch, users])

  const incidentRows = useMemo(() => {
    const liveRows = activeIncidents.map((incident) => ({
      ...incident,
      flagged: incident.severity === "High",
      onDelete: async () => {
        await deleteIncident(incident.id)
        setIncidents((currentIncidents) => currentIncidents.filter((currentIncident) => currentIncident.id !== incident.id))
      },
    }))

    return [...liveRows, ...flaggedIncidentFallback]
      .filter((incident) => {
        if (!normalizedIncidentSearch) {
          return true
        }

        return incident.address.toLowerCase().includes(normalizedIncidentSearch)
          || incident.createdBy.toLowerCase().includes(normalizedIncidentSearch)
          || incident.severity.toLowerCase().includes(normalizedIncidentSearch)
      })
  }, [activeIncidents, normalizedIncidentSearch])

  const commentRows = useMemo(() => {
    return comments
      .map((comment) => {
        const relatedIncident = incidents.find((incident) => (
          incident.commentItems.some((commentItem) => commentItem.id === comment._id)
        ))
        const isFlagged = comment.flag && comment.flag !== "normal"

        return {
          id: comment._id,
          author: getCommentUser(comment),
          context: relatedIncident ? relatedIncident.address : "unknown incident",
          flag: comment.flag,
          isFlagged,
          text: comment.comment,
          timeAgo: formatAge(comment.createdAt),
          user: comment.user,
        }
      })
      .sort((firstComment, secondComment) => Number(secondComment.isFlagged) - Number(firstComment.isFlagged))
  }, [comments, incidents])

  const adminTabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users", dot: "red" },
    { id: "incidents", label: "Incidents", dot: "yellow" },
    { id: "comments", label: "Comments", dot: "yellow" },
  ]

  return (
    <div className="map-view-page admin-overview-page">
      <DangerzoneHeader
        incidentCount={activeIncidents.length}
        onSetPosition={() => setIsPositionModalOpen(true)}
      />

      <nav className="admin-subnav" aria-label="Admin sections">
        <span className="admin-panel-label"><span aria-hidden="true">#</span> Admin Panel</span>
        {adminTabs.map((tab) => (
          <button
            className={`admin-subnav-tab ${activeAdminTab === tab.id ? "active" : "muted"}`}
            disabled={tab.disabled}
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id)}
            type="button"
          >
            {tab.dot && <span className={`admin-dot ${tab.dot}`} />}
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-overview-shell">
        {errorMessage && <p className="admin-error">{errorMessage}</p>}

        {activeAdminTab === "overview" && (
          <>
            <section className="admin-stat-grid" aria-label="Admin metrics">
              {statCards.map((stat) => (
                <article className="admin-stat-card" key={stat.id} style={{ "--admin-accent": stat.color }}>
                  <span className="admin-stat-icon" aria-hidden="true">{stat.icon}</span>
                  <strong>{isLoading ? "--" : stat.value}</strong>
                  <span>{stat.label}</span>
                  <i aria-hidden="true" />
                </article>
              ))}
            </section>

            <section className="admin-section">
              <h1><span aria-hidden="true">!</span> Moderation Queue <b>{moderationItems.length}</b></h1>

              <div className="admin-moderation-list">
                {moderationItems.map((item) => {
                  const incidentType = item.type ? incidentTypes[item.type] : null

                  return (
                    <article className="admin-moderation-row" key={item.id} style={{ "--admin-accent": item.accent }}>
                      <div className="admin-row-copy">
                        <p>
                          <span className="admin-row-icon" aria-hidden="true">{item.kind === "comment" ? "C" : "F"}</span>
                          {incidentType && <strong style={{ color: incidentType.color }}>{incidentType.label}</strong>}
                          {!incidentType && <strong>{item.author}</strong>}
                          {incidentType && <span>by {item.author}</span>}
                          {!incidentType && item.context && <span>{item.context}</span>}
                          {item.status && <em className={`admin-status ${item.status}`}>{item.status}</em>}
                          {item.flag && <em className="admin-status warned">{item.flag}</em>}
                        </p>
                        <p>{item.text}</p>
                      </div>

                      <div className="admin-row-actions">
                        <button disabled type="button">Warn</button>
                        <button onClick={item.onDelete} disabled={!item.onDelete} type="button">Delete</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="admin-section admin-activity-section">
              <h2><span aria-hidden="true">~</span> Activity Log</h2>

              <div className="admin-activity-list">
                {activityItems.map((item) => (
                  <p key={item.id}>
                    <time>{item.time}</time>
                    <span style={{ "--admin-accent": item.color }} />
                    {item.text}
                  </p>
                ))}
              </div>
            </section>
          </>
        )}

        {activeAdminTab === "users" && (
          <section className="admin-users-view" aria-label="Users administration">
            <div className="admin-users-toolbar">
              <label className="admin-user-search">
                <span>Search users</span>
                <input
                  onChange={(event) => setUserSearchTerm(event.target.value)}
                  placeholder="Search users..."
                  type="search"
                  value={userSearchTerm}
                />
              </label>
              <strong>{isLoading ? "--" : userRows.length} Users</strong>
            </div>

            <div className="admin-user-list">
              {userRows.map((user) => {
                const rowAccent = user.status === "banned"
                  ? "#ff2b1f"
                  : user.status === "warned"
                    ? "#ffd42a"
                    : "#43d49a"

                return (
                  <article className="admin-user-row" key={user._id} style={{ "--admin-accent": rowAccent }}>
                    <div className="admin-user-identity">
                      <span className="admin-user-avatar">{getUserInitials(user)}</span>
                      <div>
                        <p>
                          <strong>{getUserDisplayName(user)}</strong>
                          <em className={`admin-status ${user.status}`}>
                            {user.status}
                          </em>
                          {user.flags > 0 && <em className="admin-flag-badge">! {user.flags} Flags</em>}
                        </p>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    <div className="admin-user-meta">
                      <span><strong>{user.reports}</strong> reports</span>
                      <span><strong>{user.commentCount}</strong> comments</span>
                      <span>{formatSince(user.createdAt)}</span>
                      <button aria-label={`Open ${getUserDisplayName(user)} details`} disabled type="button">v</button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {activeAdminTab === "incidents" && (
          <section className="admin-incidents-view" aria-label="Incidents administration">
            <div className="admin-users-toolbar">
              <label className="admin-user-search">
                <span>Search incidents</span>
                <input
                  onChange={(event) => setIncidentSearchTerm(event.target.value)}
                  placeholder="Search incidents..."
                  type="search"
                  value={incidentSearchTerm}
                />
              </label>
              <strong>{isLoading ? "--" : activeIncidents.length} Active</strong>
            </div>

            <div className="admin-incident-admin-list">
              {incidentRows.map((incident) => {
                const type = incidentTypes[incident.type] || incidentTypes.other

                return (
                  <article
                    className={incident.flagged ? "admin-incident-admin-row flagged" : "admin-incident-admin-row"}
                    key={incident.id}
                    style={{ "--admin-accent": type.color }}
                  >
                    <div className="admin-incident-admin-copy">
                      <span className="admin-incident-type-icon" aria-hidden="true">{type.icon}</span>
                      <div>
                        <p>
                          <strong>{incident.address}</strong>
                          {incident.flagged && <em className="admin-flagged-label">! Flagged</em>}
                        </p>
                        <span>by {incident.createdBy} - {incident.timeAgo} - {incident.severity}</span>
                      </div>
                    </div>

                    <div className="admin-incident-admin-actions">
                      {incident.flagged && <button disabled type="button">Warn</button>}
                      <button
                        onClick={() => setPendingIncidentDelete(incident)}
                        disabled={!incident.onDelete}
                        type="button"
                      >
                        Del
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {activeAdminTab === "comments" && (
          <section className="admin-comments-view" aria-label="Comments administration">
            <div className="admin-comments-summary">
              <span>{isLoading ? "--" : comments.length} Comments</span>
              <span>{isLoading ? "--" : flaggedComments.length} Flagged</span>
            </div>

            <div className="admin-comment-admin-list">
              {commentRows.map((comment) => (
                <article
                  className={comment.isFlagged ? "admin-comment-admin-row flagged" : "admin-comment-admin-row"}
                  key={comment.id}
                >
                  <div className="admin-comment-admin-copy">
                    <span className="admin-comment-avatar">{getUserInitials(comment.user || { username: comment.author })}</span>
                    <div>
                      <p>
                        <strong>{comment.author}</strong>
                        {comment.isFlagged && <em className="admin-toxic-label">! {comment.flag}</em>}
                        <span>on {comment.context}</span>
                      </p>
                      <p>{comment.text}</p>
                    </div>
                  </div>

                  <div className="admin-comment-admin-actions">
                    <time>{comment.timeAgo}</time>
                    {comment.isFlagged && <button disabled type="button">Warn</button>}
                    <button onClick={() => setPendingCommentDelete(comment)} type="button">Del</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {isPositionModalOpen && (
        <PositionModal
          currentPosition={userPosition}
          incidents={activeIncidents}
          onClose={() => setIsPositionModalOpen(false)}
          onUseAddress={setUserPositionFromAddress}
          onUseCurrentPosition={requestUserPosition}
          onUseIncident={setUserPositionFromIncident}
        />
      )}

      {pendingIncidentDelete && (
        <div className="admin-confirm-backdrop" role="presentation">
          <section className="admin-confirm-modal" aria-labelledby="admin-confirm-title" role="dialog" aria-modal="true">
            <header>
              <span aria-hidden="true">!</span>
              <div>
                <h2 id="admin-confirm-title">Delete Incident</h2>
                <p>This action cannot be undone.</p>
              </div>
            </header>

            <div className="admin-confirm-body">
              <strong>{pendingIncidentDelete.address}</strong>
              <span>Reported by {pendingIncidentDelete.createdBy}</span>
            </div>

            <footer>
              <button
                disabled={isDeletingIncident}
                onClick={() => setPendingIncidentDelete(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingIncident}
                onClick={handleConfirmDeleteIncident}
                type="button"
              >
                {isDeletingIncident ? "Deleting..." : "Delete"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {pendingCommentDelete && (
        <div className="admin-confirm-backdrop" role="presentation">
          <section className="admin-confirm-modal" aria-labelledby="admin-comment-confirm-title" role="dialog" aria-modal="true">
            <header>
              <span aria-hidden="true">!</span>
              <div>
                <h2 id="admin-comment-confirm-title">Delete Comment</h2>
                <p>This action cannot be undone.</p>
              </div>
            </header>

            <div className="admin-confirm-body">
              <strong>{pendingCommentDelete.author}</strong>
              <span>on {pendingCommentDelete.context}</span>
              <p>{pendingCommentDelete.text}</p>
            </div>

            <footer>
              <button
                disabled={isDeletingComment}
                onClick={() => setPendingCommentDelete(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingComment}
                onClick={handleConfirmDeleteComment}
                type="button"
              >
                {isDeletingComment ? "Deleting..." : "Delete"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminOverviewPage
