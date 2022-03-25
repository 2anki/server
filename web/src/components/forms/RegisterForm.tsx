import styled from 'styled-components';
import axios from 'axios';
import { SyntheticEvent, useState } from 'react';
import BetaMessage from '../BetaMessage';

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

interface Props {
  setErrorMessage: (errorMessage: string) => void;
}

function RegisterForm({ setErrorMessage }: Props) {
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [tos, setTos] = useState(localStorage.getItem('tos') === 'true');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () => (
    tos
      && name.length > 0
      && name.length < 256
      && email.length > 0
      && email.length < 256
      && password.length > 7
      && password.length < 256
  );

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const endpoint = '/users/register';
    setErrorMessage('');
    setLoading(true);

    try {
      const data = {
        name,
        email,
        password,
      };
      const res = await axios.post(endpoint, data);
      if (res.status === 200) {
        window.location.href = '/verify';
      } else {
        setErrorMessage(
          'Unknown error. Please try again or reach out to alexander@alemayhu.com for assistance if the issue persists.',
        );
      }
    } catch (error) {
      setErrorMessage('Request failed. If you already have a user try login instead');
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
              <h1 className="title">Join Now.</h1>
              <p className="subtitle">To get started please register below.</p>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="name" className="label">
                    Name
                    <div className="control">
                      <input
                        name="name"
                        min="1"
                        max="255"
                        className="input"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          localStorage.setItem('name', event.target.value);
                        }}
                        type="text"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label htmlFor="email" className="label">
                    Email
                    <input
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
                      name="email"
                    />
                  </label>
                </div>
                <div className="field">
                  <label htmlFor="password" className="label">
                    Password
                    Minimum 8 characters
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

                <div className="field">
                  <div className="control">
                    <label htmlFor="tos" className="checkbox">
                      <input
                        name="tos"
                        required
                        type="checkbox"
                        checked={tos}
                        onChange={(event) => {
                          setTos(event.target.checked);
                          localStorage.setItem(
                            'tos',
                            event.target.checked.toString(),
                          );
                        }}
                      />
                      {' '}
                      I agree to the
                      {' '}
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://alemayhu.notion.site/Terms-of-services-931865161517453b99fb6495e400061d"
                      >
                        terms of service
                      </a>
                      {' '}
                      and have read the
                      {' '}
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
                  <div className="control" style={{ width: '100%' }}>
                    <button
                      type="submit"
                      className="button is-link is-medium"
                      style={{ width: '100%' }}
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
}

export default RegisterForm;
