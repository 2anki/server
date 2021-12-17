import styled from "styled-components";
import axios from "axios";
import { SyntheticEvent, useState } from "react";

import BetaMessage from "../BetaMessage";
import BetaTag from "../BetaTag";

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
      console.log("res.status", res.status);
      setLoading(false);
    } catch (error) {
      let response = error.response;
      if (response && response.data) {
        let data = response.data;
        if (data.message === "not verified") {
          window.location.href = "/verify";
        } else {
          setError(data.message);
        }
      } else {
        setError(
          "Request failed. Do you remember your password? If not click forgot my password."
        );
      }
      setLoading(false);
    }
  };
  return (
    <FormContainer>
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-half">
              <BetaTag />
              <BetaMessage />
              <h1 className="title is-1">Login</h1>
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
        </div>
      </section>
    </FormContainer>
  );
};

export default LoginForm;
