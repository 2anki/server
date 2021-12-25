import styled from "styled-components";

const FormContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const VerifyPage = () => {
  return (
    <FormContainer>
      <h1 className="title is-1">Account verification required</h1>
      <hr />
      <p className="subtitle">
        Your account has not been verified yet, please check your email inbox or
        spam folder.{" "}
      </p>
      <p className="subtitle">
        If you have not received the verification email, contact{" "}
        <a href="mailto:alexander@alemayhu.com">alexander@alemayhu.com</a>.
      </p>
    </FormContainer>
  );
};

export default VerifyPage;
