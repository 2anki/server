import styled from "styled-components";

const FormContainer = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

const RegisterForm = () => {
  return (
    <FormContainer>
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-half">
              <h1 className="title">Hei there.</h1>
              <p className="subtitle">To get started please register...</p>
              <div className="field">
                <label className="label">Name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="Your e-mail"
                />
                {/* <p className="help is-danger">This email is invalid</p> */}
              </div>
              <div className="field">
                <label className="label">Password</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Your password"
                  />
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <label className="checkbox">
                    <input type="checkbox" />I agree to the{" "}
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://alemayhu.notion.site/Terms-of-services-931865161517453b99fb6495e400061d"
                    >
                      terms of service
                    </a>
                  </label>
                </div>
              </div>

              <div className="field">
                <div className="control" style={{ width: "100%" }}>
                  <button
                    className="button is-link is-medium"
                    style={{ width: "100%" }}
                  >
                    Create my account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FormContainer>
  );
};

export default RegisterForm;
