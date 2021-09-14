import styled from "styled-components";

const StyledPage = styled.div`
  background: #5397f5;
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h2 {
    font-weight: bold;
    text-transform: uppercase;
  }
  h1 {
    font-weight: bold;
  }
  h3 {
    font-weight: bold;
  }
`;

const Card = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: white;
  max-width: 256px;
  max-height: 256px;
  color: black;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-weight: bold;
  }
  h3 {
    font-weight: bold;
  }
`;

const PricingPlans = styled.div`
  display: flex;
`;

const SelectButton = styled.div`
  background: rgb(58, 160, 218);
  border: 1px solid rgb(48, 139, 191);
  font-weight: bold;
  border-radius: 0.2rem;
  margin-top: 0.5rem;
  display: inline-block;
  a {
    color: white;
    padding: 0.3rem 0.5rem;
  }
`;

const PreSignupPage = () => {
  return (
    <StyledPage>
      <h2>new</h2>
      <h1>Download study notes automatically into your brain</h1>
      <p>Automatic syncing between notion and anki</p>
      <h3>Get a 10% discount if you pre-signup. No creditcard needed.</h3>
      <p>Select your plan</p>

      <PricingPlans>
        <Card>
          <h3>Monthly</h3>
          <p>Perfect for students on a budget</p>
          <p>10 $/moth</p>
          <div>
            <SelectButton>
              <a href="#">Select</a>
            </SelectButton>
          </div>
        </Card>
        <Card>
          <h3>life time supporter</h3>
          <p>For die-hard supporters and life-long learners</p>
          <p>90 $ once</p>
          <div>
            <SelectButton>
              <a href="#">Select</a>
            </SelectButton>
          </div>
        </Card>
      </PricingPlans>
    </StyledPage>
  );
};

export default PreSignupPage;
