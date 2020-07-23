import './call-for-action'

tag n2a-header

	css h1 fs:2xl fw: bold ls: -0.025rem m: 0 p: 0.5rem 1rem c: #1E1D1C bg: #FCF4A7 @hover: green400
	css p p: 0 m: 0.5rem
	css .nav-link c: white p: 0.1rem 0.5rem m: 0.5rem 1rem 0.5rem 0 td: none ls: 2px fs: xl

	prop active = false

	def render
		<self>
			<nav.navbar.is-info[bg: #83C9F5]>
				<div.navbar-brand>
					<a.navbar-item href="/">
						<h1[br: 0.3rem]> "notion2anki"
					<div.navbar-burger.burger.is-active=active data-target="navbarExampleTransparentExample" @click.{active=!active}>
						<span>
						<span>
						<span>
				<div#navbarExampleTransparentExample.navbar-menu.is-active=active>
					<div.navbar-start>
						<a.navbar-item href="/upload"> "Create"
						<a.navbar-item href="/contact"> "Contact"							
						<div.navbar-item.has-dropdown.is-hoverable>
							<a.navbar-link> "Useful links"
							<div.navbar-dropdown.is-boxed>
								<a.navbar-item href="/faq"> "FAQ"
								<a.navbar-item href="/privacy"> "Privacy"
								<hr.navbar-divider>
								<a.navbar-item target="_blank" target="_blank" href="https://docs.ankiweb.net/#/"> "Anki Manual"
								<a.navbar-item.is-active target="_blank" target="_blank" href="https://skl.sh/2WhV7F6"> "Skillshare"
					<div.navbar-end>
						<div.navbar-item>
							<div.field.is-grouped>
								<p.control>
									<a.bd-tw-button.button target="_blank" target="_blank" href="https://github.com/alemayhu/notion2anki">
										<span.icon>
											<i.fab.fa-github>
										<span> "Github"
								<p.control>
									<a.button target="_blank" href="https://discord.gg/PSKC3uS">
										<span.icon>
											<i.fab.fa-discord>
										<span> "Discord"		
								<p.control>
									<a.button target="_blank" href="https://twitch.tv/ccscanf">
										<span.icon>
											<i.fab.fa-twitch>
										<span> "twitch"	
								<p.control>
									<a.button target="_blank" href="https://www.patreon.com/ccscanf">
										<span.icon>
											<i.fab.fa-patreon>
										<span> "Patreon"
