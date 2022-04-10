import styled from 'styled-components';
import axios from 'axios';
import { SyntheticEvent, useState } from 'react';

import BetaMessage from '../BetaMessage';

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

interface LoginFormProps {
  onForgotPassword: () => void;
  onError: (errorMessage: string) => void;
}

function LoginForm({ onForgotPassword, onError }: LoginFormProps) {
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () => (
    email.length > 0
      && email.length < 256
      && password.length > 7
      && password.length < 256
  );

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const endpoint = '/users/login';
    setLoading(true);

    try {
      const data = {
        email,
        password,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/search';
      }
      setLoading(false);
    } catch (error) {
      const { response } = error;
      if (response && response.data) {
        const { data } = response;
        if (data.message === 'not verified') {
          window.location.href = '/verify';
        } else {
          onError(data.message);
        }
      } else {
        onError(
          'Request failed. Do you remember your password? If not click forgot my password.',
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
              <BetaMessage />
              <h1 className="title is-1">Login</h1>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email" className="label">
                    Email
                    <input
                      name="email"
                      min="3"
                      max="255"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        localStorage.setItem('email', event.target.value);
                      }}
                      className="input"
                      type="email"
                      placeholder="Your e-mail"
                      required
                    />
                  </label>
                </div>
                <div className="field">
                  <label htmlFor="password" className="label">
                    Password
                    <div className="control">
                      <input
                        name="password"
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
                  </label>
                </div>

                <div
                  tabIndex={-9}
                  role="button"
                  className="field"
                  onClick={() => onForgotPassword()}
                  onKeyDown={(event) => {
                    if (event.key === 'F9') {
                      onForgotPassword();
                    }
                  }}
                >
                  <a rel="noreferrer" href="#forgot">
                    I forgot my password
                  </a>
                </div>

                <div className="field">
                  <div className="control">
                    <button
                      type="submit"
                      className="button is-link is-medium is-pulled-right"
                      disabled={!isValid() || loading}
                    >
                      Sign in
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
}

export default LoginForm;
