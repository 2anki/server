import styled from "styled-components";
import axios from "axios";
import { SyntheticEvent, useState } from "react";

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const LoginForm = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isValid = () => {
    return (
      email.length > 0 &&
      email.length < 256 &&
      password.length > 7 &&
      password.length < 256
    );
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const endpoint = "/users/login";
    setError("");

    try {
      const data = {
        email,
        password,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        console.log(res);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setError(
        "Request failed. Do you remember your password? If not click forgot my password."
      );
      console.error(error);
    }
  };
  return (
    <FormContainer>
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-half">
              <h1 className="title">Welcome back!</h1>
              <p className="subtitle">Please login below.</p>
              {error && <div className="notification is-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Email</label>
                  <input
                    min="3"
                    max="255"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      localStorage.setItem("email", event.target.value);
                    }}
                    className="input"
                    type="email"
                    placeholder="Your e-mail"
                    required
                  />
                  {/* <p className="help is-danger">This email is invalid</p> */}
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input
                      min="8"
                      max="255"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="input"
                      type="password"
                      placeholder="Your password"
                    />
                  </div>
                </div>

                <div className="field">
                  <a rel="noreferrer" target="_blank" href="/forgot-password">
                    I forgot my password
                  </a>
                </div>

                <div className="field">
                  <div className="control" style={{ width: "100%" }}>
                    <button
                      className="button is-link is-medium"
                      style={{ width: "100%" }}
                      disabled={!isValid()}
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </FormContainer>
  );
};

export default LoginForm;
