tag n2a-header < header

	css h1 fs:2xl fw: bold ls: -0.025rem m: 0 p: 0.5rem 1rem c: #1E1D1C 

	prop active = false

	def render
		<self[d: block py: 1rem bg: red]>
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
						<.navbar-item>
							<a[fw: bold my: 2rem c@focus: #3273DC] .button .is-primary href="/upload"> "Create"
						<a.navbar-item href="/benefits"> "Benefits"
						<a.navbar-item href="/contact"> "Contact"
						<a.navbar-item href="/faq"> "FAQ"
						<a.navbar-item href="/privacy"> "Privacy"		
						<a.navbar-item href="/links"> "Useful Links"
						<.navbar-item>
							<a[fw: bold my: 2rem c: #3273DC].button href="https://www.twitch.tv/alexanderalemayhu"> "Alemayhu on Twitch"			

					<div.navbar-end>
						<div.navbar-item>
							<a.button[bd: 1px solid rgb(45, 124, 218) bg: rgb(45, 124, 218) c: white border-radius: 0.3rem] target="_blank" href="https://www.patreon.com/alemayhu">
								<span[fw: bold]> "Become a Patron"							
						<div.navbar-item>
							<a.button[bd: 3px solid #00B1D2 c: #00B1D2] target="_blank" href="https://github.com/sponsors/alemayhu">
								<span[tt: uppercase fw: bold]> "Sponsor"