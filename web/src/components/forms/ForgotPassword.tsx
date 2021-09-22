import styled from "styled-components";
import axios from "axios";
import { SyntheticEvent, useState } from "react";

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [didReset, setDidReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = () => {
    return email.length > 0 && email.length < 256;
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const endpoint = "/users/forgot-password";
    setError("");
    setLoading(true);
    setDidReset(false);

    try {
      const data = {
        email,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        console.log(res);
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      }
      setLoading(false);
      setDidReset(true);
    } catch (error) {
      setError("Request failed. Are you sure you have registered an account?");
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
              <h1 className="title is-4">Forgot your password?</h1>
              <p className="subtitle">Please enter your email below.</p>
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
                  <div className="control" style={{ width: "100%" }}>
                    <button
                      className="button is-link is-medium"
                      style={{ width: "100%" }}
                      disabled={!isValid() || loading}
                    >
                      Reset my password
                    </button>
                  </div>
                </div>
                {didReset && (
                  <p>You should receive an email if your account exists.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </FormContainer>
  );
};

export default ForgotPasswordForm;
