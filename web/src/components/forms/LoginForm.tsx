import styled from "styled-components";
import axios from "axios";
import React, { SyntheticEvent, useState } from "react";

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

/* @ts-ignore */
const LoginForm = ({ onForgot }) => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const data = {
        email,
        password,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        console.log(res);
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      }
      setLoading(false);
    } catch (error) {
      setError(
        "Request failed. Do you remember your password? If not click forgot my password."
      );
      setLoading(false);
      console.error(error);
    }
  };
  return (
    <FormContainer>
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-half">
              <span className="tag is-danger">BETA</span>
              <h1 className="title">Please login below!</h1>
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

                <div className="field" onClick={() => onForgot()}>
                  <a rel="noreferrer" href="#forgot">
                    I forgot my password
                  </a>
                </div>

                <div className="field">
                  <div className="control">
                    <button
                      className="button is-link is-medium is-pulled-right"
                      disabled={!isValid() || loading}
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div
            style={{ margin: "0 auto" }}
            className="notification is-danger is-half column"
          >
            <p className="is-size-7">
              The Notion integration is still under development. Thank you for
              being patient! Please send issues and ideas to{" "}
              <a href="mailto:a@alemayhu.com">a@alemayhu.com</a>.
            </p>
          </div>
        </div>
      </section>
    </FormContainer>
  );
};

export default LoginForm;
