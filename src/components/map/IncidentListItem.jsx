import { incidentTypes } from "../../data/mockIncidents"

const severityClassNames = {
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low",
}

function IncidentListItem({ incident }) {
  const type = incidentTypes[incident.type]

  return (
    <article className="incident-list-item">
      <div
        className="incident-type-icon"
        style={{ "--incident-color": type.color }}
        aria-hidden="true"
      >
        {type.icon}
      </div>

      <div className="incident-copy">
        <div className="incident-row">
          <h3 style={{ color: type.color }}>{type.label}</h3>
          <span>{incident.timeAgo}</span>
        </div>
        <p>{incident.address}</p>
        <p className="incident-author">by {incident.createdBy}</p>
        <div className="incident-meta">
          <span className={severityClassNames[incident.severity]}>
            {incident.severity}
          </span>
          {incident.comments > 0 && <span>{incident.comments} comments</span>}
        </div>
      </div>

      <span className="incident-chevron">&gt;</span>
    </article>
  )
}

export default IncidentListItem
