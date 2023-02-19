import styled from 'styled-components';
import { SyntheticEvent, useState } from 'react';
import Backend from '../../lib/backend';
import { ErrorHandlerType, ErrorType } from '../errors/helpers/types';

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

interface ForgotPasswordProps {
  setError: ErrorHandlerType;
}

function ForgotPasswordForm({ setError }: ForgotPasswordProps) {
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [didReset, setDidReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setDidReset(false);

    try {
      const backend = new Backend();
      await backend.forgotPassword(email);
      setLoading(false);
      setDidReset(true);
    } catch (error) {
      setError(error as ErrorType);
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
                {!didReset && <div className="field">
                  <div className="control" style={{ width: '100%' }}>
                    <button
                      type="submit"
                      className="button is-link is-medium"
                      style={{ width: '100%' }}
                      disabled={loading}
                    >
                      Reset my password
                    </button>
                  </div>
                </div>}
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
}

export default ForgotPasswordForm;
