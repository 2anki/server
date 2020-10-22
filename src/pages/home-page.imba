import '../components/youtube-embed'

tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"
	prop tutorial = "https://www.youtube.com/embed/NLUfAWA2LJI"
	prop githubSponsor = "https://github.com/sponsors/alemayhu"
	prop patreon = "https://patreon.com/alemayhu"

	css .cta bg: #83C9F5 c: white fw: bold
	css .column m: 16px

	def render
		<self[d: block my: 1rem]>
			<section.hero.is-medium>
				<div.hero-body>
					<div.container>
						<.columns>
							<.column>
								<h1 .title .is-size-1> "Create Anki flashcards ✨"								
								<h2.subtitle> "Fast, simple, easy and 100% {<span[fw: bold td: underline tdc: green3]> "Free"}"					
								<p.subtitle .is-4> "It's a passion project 🕺🏾💃🏾"
								<a.button[fw: bold] .is-primary .is-large href="/upload"> "Get Started"
							<.column>
								<p.subtitle .is-4> "We are making it the easiest and fastest way to create beautiful ⭐️ Anki flashcards for anyone anywhere around the world 🌎"
								<.has-text-centered>
									<a.button.is-light .is-large href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd" target="_blank">
										<span[fw: bold]> "Video Tutorials"

						<.bd-focus[m: 3rem auto 0]>
							<.columns>
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Free"
									<p .subtitle .is-6> "The code is on {<strong> "GitHub"}"									
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Fast"
									<p .subtitle .is-6> "Trade hours for seconds"									
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "150MB"
									<p .subtitle .is-6> "Free upload quota"									
								<.column .bd-focus-item .has-text-centered>
									<p .title .is-4> "Friendly"
									<p .subtitle .is-6> "Join a community of winners 💪🏾"									
			<.section .bd-tws-home .is-medium[bgc: #F9F9F9 w: 100%]>
				<header .bd-index-header>
					<.container>
						<h3 .title .is-3> "What people are saying about notion2anki"
						<hr>
						<p.subtitle> "These comments are taken from our YouTube videos."
						<.columns >
							<.column> for i in [1...13]
								<img[m: 2rem w: 296px @sm: 320px @md:700px] .image loading="lazy" src="/user-feedback/{i}.png" alt="user feedback {i}">
				<.has-text-centered>							
					<a .button .is-large .is-primary[bg: #3273dc fw: bold white-space: normal fs: 11pt fs@md: 16pt] target="_blank" href="https://discord.gg/PSKC3uS"> "Let's grow the community, join us on Discord 🤗"

			<.section .bd-easy .is-medium>			
				<.container>
					<h3 .title .is-3> "Save your {<span[c: #00D1B2]> "time"} today ⏳"
					<h4 .subtitle .is-4> "Let notion2anki do it in 10 seconds for you"
					# Stop wasting your time  Instead of copy pasting or typing in for hours and hours, 
					<.has-text-centered>
						<a[mt: 2rem fw: bold fs: 16pt].button.is-info.is-medium href="/benefits"> "notion2anki benefits"
			<.section>
				<.container>
					<h2.title> "Video Tutorial: How to turn any website in to Anki flashcards using the Notion Web Clipper with notion2anki"
					<hr>
					<p.subtitle> "In this video, {<a[c: #3273dc] href="https://alemayhu.com"> "I"} show you how to use notion2anki"
					<.has-text-centered>
						<youtube-embed video=tutorial inline=false title="Video Tutorial: How to turn any website in to Anki flashcards using the Notion Web Clipper with notion2anki" inline=false>
						<a[mt: 2rem].button .is-primary .is-large href="/upload"> "I want to save my time"
