import styled from 'styled-components';

const StyledFooter = styled.footer`
  flex-shrink: 0;
  padding: 1rem;
  background: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Header = styled.p`
  color: grey;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

function Footer() {
  return (
    <StyledFooter>
      <div className="columns">
        <div className="column">
          <Header>General</Header>
          <p>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://alemayhu.notion.site/Benefits-0d5fa2e18a8a44d782c72945b2bd413b"
            >
              Benefits
            </a>
          </p>
          <p>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://alemayhu.notion.site/Privacy-38c6e8238ac04ea9b2485bf488909fd0"
            >
              Privacy
            </a>
          </p>
          <p>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://alemayhu.notion.site/FAQ-ef01be9c9bac41689a4d749127c14301"
            >
              FAQ
            </a>
          </p>
        </div>
        <div className="column">
          <Header>Community</Header>
          <p>
            <a href="https://www.reddit.com/r/notion2anki/">r/notion2anki</a>
          </p>
          <p>
            <a href="https://discord.gg/PSKC3uS">Discord server</a>
          </p>
          <p>
            <a href="https://www.youtube.com/c/AlexanderAlemayhu">YouTube</a>
          </p>
        </div>
        <div className="column">
          <Header>Developer</Header>
          <p>
            <a href="https://github.com/alemayhu/notion2anki/issues?q=is%3Aopen+is%3Aissue+milestone%3A%E4%B8%80%E7%95%AA%E3%83%BBv1.0.0">
              Roadmap
            </a>
          </p>
          <p>
            <a href="https://github.com/alemayhu/notion2anki/issues/new">
              Report
            </a>
          </p>
          <p>
            <a href="https://github.com/alemayhu/notion2anki/issues">Issues</a>
          </p>
        </div>
        <div className="column">
          <Header>Sponsors</Header>
          <p>
            <a href="https://scrimba.com">
              <img
                src="/sponsors/Scrimba.png"
                alt="Sponsored by Scrimba"
                loading="lazy"
              />
            </a>
          </p>
          <p>
            <a href="https://www.digitalocean.com/?refcode=c5a16996cd0e&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=CopyPaste">
              <img
                style={{ width: '201px' }}
                src="https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/PoweredByDO/DO_Powered_by_Badge_blue.svg"
                alt="Powered by DigitalOcean"
                loading="lazy"
              />
            </a>
          </p>
          <p>
            <a href="https://www.netlify.com">
              <img
                src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
                alt="Deploys by Netlify"
                loading="lazy"
              />
            </a>
          </p>
          <p>
            <a href="https://fortress.no">
              <img
                src="https://fortress.no/icons/logo.svg"
                alt="Sponsored by Fortress"
                loading="lazy"
                style={{ width: '60px' }}
              />
            </a>
          </p>
        </div>
      </div>
      <div className="content has-text-centered">
        <p>
          <a href="https://github.com/alemayhu/notion2anki/">This</a>
          {' '}
          is an open
          source project by
          <span> </span>
          <a href="https://alemayhu.com">Alexander Alemayhu</a>
        </p>
        <span>Developed in 🇳🇴 with ❤️</span>
      </div>
    </StyledFooter>
  );
}

export default Footer;
