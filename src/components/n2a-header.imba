const host = window.location.host
let vers = ""
let link = "https://github.com/alemayhu/Notion-to-Anki/tree/"
if host !== "dev.2anki.net"
	vers = "Dev"
	link = link + vers.toLowerCase();

tag n2a-header < header

	css h1 fs:2xl fw: bold ls: -0.025rem m: 0 p: 0.5rem 1rem c: #1E1D1C 

	prop active = false

	def render
		<self[d: block py: 1rem]>
			<nav.navbar .is-fixed-top>
				<div.navbar-brand>
					<a .navbar-item href="/">
						<img[h: 112px w: 112px object-fit: contain] src="/logo_nav.png" alt="Notion to Anki" loading="lazy">
					<div.navbar-burger.burger.is-active=active data-target="navbarExampleTransparentExample" @click.{active=!active}>
						<span>
						<span>
						<span>
				<div#navbarExampleTransparentExample.navbar-menu.is-active=active>
					<div.navbar-start>
						<.navbar-item>
							<a[fw: bold my: 2rem  bg: rgb(207, 83, 89) bg@hover: rgb(207, 83, 0)] .button .is-primary href="/upload"> "Create"
						<a.navbar-item  rel="noreferrer" target="_blank" href="https://www.notion.so/alemayhu/Benefits-0d5fa2e18a8a44d782c72945b2bd413b"> "Benefits"
						<a.navbar-item  rel="noreferrer" target="_blank" href="https://www.notion.so/alemayhu/Contact-e76523187cc64961972b3ad4f7cb4c47"> "Contact"
						<a.navbar-item  rel="noreferrer" target="_blank" href="https://www.notion.so/alemayhu/FAQ-ef01be9c9bac41689a4d749127c14301"> "FAQ"
						<a.navbar-item  rel="noreferrer" target="_blank" href="https://www.notion.so/alemayhu/Privacy-38c6e8238ac04ea9b2485bf488909fd0"> "Privacy"		
						<a.navbar-item  rel="noreferrer" target="_blank" href="https://www.notion.so/alemayhu/Useful-Links-0f3051946a2d4b71ae31610da76b28a8"> "Useful Links"
						<a.navbar-item  rel="noreferrer" target="_blank"  href="https://github.com/alemayhu/notion2anki"> "Code"			

					<div.navbar-end>
						if vers !== ""
							<div.navbar-item>
								<a.button .is-light  rel="noreferrer" target="_blank" href=link>
									<span[fw: bold]> vers							
						<div.navbar-item>
							<a.button .is-danger .is-light  rel="noreferrer" target="_blank" href="https://www.patreon.com/alemayhu">
								<span[fw: bold]> "Become a Patron"							
						<div.navbar-item>
							<a.button .is-info  .is-light  rel="noreferrer" target="_blank" href="https://github.com/sponsors/alemayhu">
								<span[tt: uppercase fw: bold]> "Sponsor"