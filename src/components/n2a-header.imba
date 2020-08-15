import './call-for-action'

tag n2a-header

	css h1 fs:2xl fw: bold ls: -0.025rem m: 0 p: 0.5rem 1rem c: #1E1D1C 

	prop active = false

	def render
		<self>
			<nav.navbar .is-fixed-top>
				<div.navbar-brand>
					<a.navbar-item href="/">
						<h1[br: 0.3rem]> "2anki.net"
					<div.navbar-burger.burger.is-active=active data-target="navbarExampleTransparentExample" @click.{active=!active}>
						<span>
						<span>
						<span>
				<div#navbarExampleTransparentExample.navbar-menu.is-active=active>
					<div.navbar-start>
						<a.navbar-item href="/upload"> "Create"
						<a.navbar-item href="/features"> "Features" 
						<a.navbar-item href="/contact"> "Contact"
						<a.navbar-item href="/faq"> "FAQ"
						<a.navbar-item href="/privacy"> "Privacy"						
						<div.navbar-item.has-dropdown.is-hoverable>
							<a.navbar-link> "Useful links"
							<div.navbar-dropdown.is-boxed>
								<a.navbar-item target="_blank" href="https://skl.sh/2WhV7F6"> "Skillshare"
								<hr.navbar-divider>
								<a.navbar-item target="_blank" href="https://www.reddit.com/r/Anki/"> "Anki: a forum about the Anki flashcard app"
								<a.navbar-item target="_blank" href="https://apps.apple.com/us/app/ankimobile-flashcards/id373493387"> " AnkiMobile Flashcards"
								<a.navbar-item target="_blank" href="https://play.google.com/store/apps/details?id=com.ichi2.anki&hl=no"> "AnkiDroid Flashcards"
								<a.navbar-item target="_blank" href="https://docs.ankiweb.net/#/"> "Anki Manual"
								<hr.navbar-divider>
								<a.navbar-item target="_blank" href="https://www.youtube.com/user/MATTvsJapan"> "Matt vs. Japan"
								<a.navbar-item target="_blank" href="https://www.youtube.com/user/Sepharoth64"> "Ali Abdaal"
								<a.navbar-item target="_blank" href="https://www.youtube.com/channel/UC-DExX14VBH75q9Fw7wVbAw"> "Philipp (German)"


					<div.navbar-end>
						<div.navbar-item>
							<a.button[bg: rgb(232, 91, 70) c: white border-radius: 0.3rem] target="_blank" href="https://www.patreon.com/alemayhu">
								<span .icon .is-large>
									<i.fab.fa-patreon>
								<span[tt: uppercase fw: bold]> "Become a Patreon"							
						<div.navbar-item>
							<div.field.is-grouped>
								<p.control[p:2]>
									<a[c: blue] href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WUARHGVHUZ5FL&source=ur">
										<span .icon .is-large> <i .fa-2x .fab .fa-paypal aria-hidden="true">
								<p.control[p: 2]>
									<a[c: black] target="_blank" href="https://github.com/alemayhu/notion2anki">
										<span .icon .is-large>
											<i .fa-2x .fab.fa-github>
								<p.control[p: 2]>
									<a[c: #7289da] target="_blank" href="https://discord.gg/PSKC3uS">
										<span.icon .is-large>
											<i .fa-2x .fab.fa-discord>
								<p.control[p: 2]>
									<a[c: #6441a5] target="_blank" href="https://twitch.tv/alemayhu">
										<span.icon .is-large>
											<i .fa-2x .fab.fa-twitch>