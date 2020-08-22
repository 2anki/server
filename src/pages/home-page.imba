import '../components/youtube-embed'

tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"
	prop tutorial = "https://www.youtube.com/embed/lpC7C9wJoTA"

	prop heroVideo = "https://www.youtube.com/embed/reviIJj52ZA"
	prop heroVideoTitle = "Welcome 👋🏾"

	prop bizSponsor = "https://www.patreon.com/join/alemayhu/checkout?rid=5599393"
	prop githubSponsor = "https://github.com/sponsors/alemayhu"
	prop patreon = "https://patreon.com/alemayhu"

	css .cta bg: #83C9F5 c: white fw: bold
	css .column m: 16px

	def render
		<self[d: block my: 4rem]>
			<section.hero.is-medium>
				<div.hero-body>
					<div.container>
						<h1 .title .is-size-1> "Create better Anki flashcards faster and easier today!"
						<hr>
						<h2.subtitle> "Convert Notion toggle lists to Anki Flashcards fast and easy 😉"					
						<.columns>
							<.column>
								<p.subtitle .is-2> "{<strong[fw: bold]> "notion2Anki"} is 100% 🆓 and open source with no limitations on file size. It's a passion project 🕺🏾💃🏾 We are going to make this a good way to make Anki flashcards easier, better and faster for anyone anywhere around the world 🌎"

								<div[d: flex j: center a: center mt: 2rem flex-wrap: wrap].columns>
									<div.column>
										<a.button[fw: bold] .is-primary .is-large href="/upload"> "Get Started"
									<div.column>
										<a.button.is-light .is-large href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd" target="_blank">
											<span.icon[c: red]>
												<i.fab.fa-youtube>
											<span[fw: bold]> "Tutorials"
							<.column>
								<.has-text-centered>
									<youtube-embed video=heroVideo inline=false title=heroVideoTitle>
						<.bd-focus[m: 6rem auto 0]>
							<.columns>
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Free"
									<p .subtitle .is-6> "The code is on {<strong> "GitHub"}"									
									<figure .bd-focus-icon>
										<span .bd-focus.github .icon .is-large>
											<i.fa-4x.fab.fa-github>
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Fast"
									<p .subtitle .is-6> "Trade hours for seconds"									
									<figure .bd-focus-icon>
										<span .bd-focus.github .icon .is-large>
											<i .fa-4x .fas .fa-shipping-fast>
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Unlimited"
									<p .subtitle .is-6> "No limitations on the file size"									
									<figure .bd-focus-icon>
										<span .bd-focus.github .icon .is-large>
											<i .fa-4x .fas .fa-file-archive>												
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Friendly"
									<p .subtitle .is-6> "Join a community of winners 💪🏾"									
									<figure .bd-focus-icon>
										<span .bd-focus.github .icon .is-large>
											<i .fa-4x .fas .fa-splotch>												

			<.section>
				<.bd.partnrs-list .has-text-centered>
					<p .bd-partner-title>
						"notion2anki is possible thanks to it's {<a href=patreon target="_blank"> "Patreon"} and {<a href=githubSponsor target="_blank"> "GitHub sponsors"}"
					<div[d: flex jc: center]>
						<p[mt: 2rem border: 3px solid black p: 4 w: 60%]> "Become a sponsor on Patreon to get your company listed here."
					<a[mt:1.5rem].button .is-primary .is-medium href=bizSponsor target="_blank"> "Become a sponsor"

			<.section .bd-tws-home .is-medium[bgc: #F9F9F9 w: 100%]>
				<header .bd-index-header>
					<.container>
						<h3 .title .is-3> "What people are saying about notion2anki"
						<hr>
						<p.subtitle> "These comments are taken from our YouTube videos."
						<.columns >
							<.column> for i in [1...13]
								<img[m: 2rem w: 296px @sm: 320px @md:700px] .image loading="lazy" src="/user-feedback/{i}.png">
				<.has-text-centered>							
					<a .button .is-large .is-primary[bg: #3273dc fw: bold white-space: normal fs: 11pt fs@md: 16pt] target="_blank" href="https://discord.gg/PSKC3uS"> "Let's grow the community, join us on Discord 🤗"

			<.section .bd-easy .is-medium>
				<.container>
					<h3 .title .is-3> "Save your {<span[c: #00D1B2]> "time"} today ⏳"
					<h4 .subtitle .is-4> "Let notion2anki do it in 10 seconds for you"
					# Stop wasting your time  Instead of copy pasting or typing in for hours and hours, 
					<.has-text-centered>
						<a[mt: 2rem fw: bold fs: 16pt].button.is-info.is-medium href="/features"> "notion2anki features"
			<.section>
				<.container>
					<h2.title> "Video Tutorial: How to use notion2anki"
					<hr>
					<p.subtitle> "In this video, {<a[c:blue700] href="https://alpkaanaksu.com"> "Alp Kaan"} shows you how to use notion2anki"
					<.has-text-centered>
						<youtube-embed video=tutorial inline=false title="Video Tutorial: How to use notion2anki" inline=false>
						<a[mt: 2rem].button .is-primary .is-large href="/upload"> "I want to save my time"
