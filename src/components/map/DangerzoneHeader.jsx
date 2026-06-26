import "../../styles/mapView.css"

function DangerzoneHeader({ incidentCount }) {
  return (
    <header className="dz-header">
      <div className="dz-brand">
        <span className="dz-logo">!</span>
        <span>DANGER<span>ZONE</span></span>
      </div>

      <nav className="dz-top-nav" aria-label="Dangerzone sections">
        <a className="dz-nav-link dz-nav-link-active" href="/">
          <span>MAP</span> VIEW
        </a>
        <a className="dz-nav-link" href="/private-page-example">
          INCIDENTS <span className="dz-count-badge">{incidentCount}</span>
        </a>
      </nav>

      <div className="dz-user-status">
        <span className="dz-online-dot" />
        <span>Marco Weber</span>
        <span className="dz-logout-icon">-&gt;</span>
      </div>
    </header>
  )
}

export default DangerzoneHeader
