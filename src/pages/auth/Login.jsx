// import axios from "axios";
import service from "../../services/service.config";

import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import "../../styles/auth.css";

function Login() {

  const { authenticateUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState(null)

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const fillUserDemo = () => {
    setEmail("user@dangerzone.app");
    setPassword("Dangerzone1");
    setErrorMessage(null);
  };

  const fillAdminDemo = () => {
    setEmail("admin@dangerzone.app");
    setPassword("Dangerzone1");
    setErrorMessage(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ... contact backend to validate user credentials
      
      const body = { email, password }

      const response = await service.post("/auth/login", body)
      console.log(response)

      // storing the token in localStorage
      localStorage.setItem("authToken", response.data.authToken)

      // this is validating the token after receiving it in order to update all global stares accordingly
      await authenticateUser()

      navigate("/")

    } catch (error) {
      console.log(error)
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.errorMessage)
      }
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel" aria-label="Dangerzone sign in">
        <header className="auth-brand">
          <div className="auth-brand-row">
            <span className="auth-logo" aria-hidden="true">!</span>
            <strong>DANGER<span>ZONE</span></strong>
          </div>
          <p>City Incident Reporting Network</p>
        </header>

        <div className="auth-card">
          <nav className="auth-tabs" aria-label="Authentication">
            <Link className="auth-tab active" to="/login">Sign In</Link>
            <Link className="auth-tab" to="/signup">Register</Link>
          </nav>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-field">
              <span>E-Mail</span>
              <div className="auth-input-wrap">
                <span aria-hidden="true" className="auth-field-icon">@</span>
                <input
                  type="email"
                  name="email"
                  placeholder="marco@dangerzone.app"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <span aria-hidden="true" className="auth-field-icon">#</span>
                <input
                  type="password"
                  name="password"
                  placeholder="........"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {errorMessage && <p className="auth-error">{errorMessage}</p>}

            <button className="auth-submit" type="submit">
              <span aria-hidden="true">~</span>
              Enter Dangerzone
            </button>
          </form>

          <div className="auth-demo-actions">
            <button type="button" onClick={fillUserDemo}>o User Demo</button>
            <button type="button" className="admin" onClick={fillAdminDemo}># Admin Demo</button>
          </div>
        </div>

        <footer className="auth-footer">DANGERZONE v1.0 - Berlin, 2026</footer>
      </section>
    </div>
  );
}

export default Login;
