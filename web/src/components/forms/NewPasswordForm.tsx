import styled from 'styled-components';
import axios from 'axios';
import { SyntheticEvent, useState } from 'react';

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

interface Props {
  setErrorMessage: (errorMessage: string) => void;
}

function NewPasswordForm({ setErrorMessage }: Props) {
  const [password, setPassword] = useState('');
  const [passwd, setPasswd] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () => password === passwd && password.length > 0 && password.length < 256;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const endpoint = '/users/new-password';
    setErrorMessage('');
    setLoading(true);

    try {
      const paths = window.location.pathname.split('/');
      const data = {
        reset_token: paths[paths.length - 1],
        password,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        window.location.href = '/login#login';
      }
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.response.data.message);
      setLoading(false);
    }
  };
  return (
    <FormContainer>
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-half">
              <h1 className="title is-4">Change your password?</h1>
              <p className="subtitle">Please enter your new password below.</p>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <input
                    min="8"
                    max="255"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                    className="input"
                    type="password"
                    placeholder="New password"
                    required
                  />
                </div>
                <div className="field">
                  <input
                    min="8"
                    max="255"
                    value={passwd}
                    onChange={(event) => {
                      setPasswd(event.target.value);
                    }}
                    className="input"
                    type="password"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                <div className="field">
                  <div className="control" style={{ width: '100%' }}>
                    <button
                      type="submit"
                      className="button is-success is-medium"
                      style={{ width: '100%' }}
                      disabled={!isValid() || loading}
                    >
                      Reset password
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

export default NewPasswordForm;
