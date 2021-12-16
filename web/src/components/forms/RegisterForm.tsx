import styled from "styled-components";
import axios from "axios";
import { SyntheticEvent, useState } from "react";
import BetaTag from "../BetaTag";

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const RegisterForm = () => {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [tos, setTos] = useState(localStorage.getItem("tos") === "true");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = () => {
    return (
      tos &&
      name.length > 0 &&
      name.length < 256 &&
      email.length > 0 &&
      email.length < 256 &&
      password.length > 7 &&
      password.length < 256
    );
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const endpoint = "/users/register";
    setError("");
    setLoading(true);

    try {
      const data = {
        name,
        email,
        password,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        window.location.href = "/dashboard";
      } else {
        setError(
          "Unknown error. Please try again or reach out to alexander@alemayhu.com for assistance if the issue persists."
        );
      }
    } catch (error) {
      setError("Request failed. If you already have a user try login instead");
      console.error(error);
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
              <h1 className="title">Hei there.</h1>
              <p className="subtitle">To get started please register below.</p>
              {error && <div className="notification is-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Name</label>
                  <div className="control">
                    <input
                      min="1"
                      max="255"
                      className="input"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        localStorage.setItem("name", event.target.value);
                      }}
                      type="text"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
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
                  Minimum 8 characters
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
                  <div className="control">
                    <label className="checkbox">
                      <input
                        required
                        type="checkbox"
                        checked={tos}
                        onChange={(event) => {
                          setTos(event.target.checked);
                          localStorage.setItem(
                            "tos",
                            event.target.checked.toString()
                          );
                        }}
                      />{" "}
                      I agree to the{" "}
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://alemayhu.notion.site/Terms-of-services-931865161517453b99fb6495e400061d"
                      >
                        terms of service
                      </a>{" "}
                      and have read the{" "}
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://alemayhu.notion.site/Privacy-38c6e8238ac04ea9b2485bf488909fd0"
                      >
                        privacy policy
                      </a>
                      .
                    </label>
                  </div>
                </div>

                <div className="field">
                  <div className="control" style={{ width: "100%" }}>
                    <button
                      className="button is-link is-medium"
                      style={{ width: "100%" }}
                      disabled={!isValid() || loading}
                    >
                      Create my account
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

export default RegisterForm;
