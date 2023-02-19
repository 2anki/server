import styled from 'styled-components';

import BetaMessage from '../../BetaMessage';
import { ErrorHandlerType } from '../../errors/helpers/types';
import { isValidCredentials } from './helpers/isValidCredentials';
import { useHandleLoginSubmit } from './helpers/useHandleLoginSubmit';

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

interface LoginFormProps {
  onForgotPassword: () => void;
  onError: ErrorHandlerType;
}

function LoginForm({ onForgotPassword, onError }: LoginFormProps) {
  const { email, password, loading, onSubmit, setEmail, setPassword } =
    useHandleLoginSubmit(onError);

  return (
    <FormContainer>
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-half">
              <BetaMessage />
              <h1 className="title is-1">Login</h1>
              <form onSubmit={onSubmit}>
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
                      disabled={!isValidCredentials(email, password) || loading}
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
