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
						<.navbar-item>
							<a[my: 2rem c@focus: #3273DC] .button .is-primary href="/upload"> "Create"
						<a.navbar-item href="/benefits"> "Benefits"
						<a.navbar-item href="/contact"> "Contact"
						<a.navbar-item href="/faq"> "FAQ"
						<a.navbar-item href="/privacy"> "Privacy"		
						<a.navbar-item href="/links"> "Useful Links"				

					<div.navbar-end>
						<div.navbar-item>
							<a.button[bg: rgb(232, 91, 70) c: white border-radius: 0.3rem] target="_blank" href="https://www.patreon.com/alemayhu">
								<span .icon .is-large>
									<i.fab.fa-patreon>
								<span[tt: uppercase fw: bold]> "Become a Patron"							
						<div.navbar-item>
							<a.button.is-primary target="_blank" href="https://github.com/sponsors/alemayhu">
								<span .icon .is-large>
									<i.fab.fa-github>
								<span[tt: uppercase fw: bold]> "Sponsor"							
						<div.navbar-item>
							<div.field.is-grouped>
								<p.control[p:2]>
									<a[c: blue] href="https://paypal.me/alemayhu">
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
