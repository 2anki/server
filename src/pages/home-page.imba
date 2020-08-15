import '../components/page-content'
import '../components/youtube-embed'


tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"
	prop tutorial = "https://www.youtube.com/embed/lpC7C9wJoTA"
	prop pitch = "https://www.youtube.com/embed/FjifJG4FoXY"

	prop bizSponsor = "https://www.patreon.com/join/alemayhu/checkout?rid=5599393"
	prop githubSponsor = "https://github.com/sponsors/alemayhu"
	prop patreon = "https://patreon.com/alemayhu"

	css .cta bg: #83C9F5 c: white fw: bold

	def render
		<self[d: block my: 2rem]>
			<section.hero.is-medium>
				<div.hero-body>
					<div.container>
						<h1 .title .is-size-1> "Create better Anki flashcards faster and easier today!"
						<hr>
						<h2.subtitle> "Convert Notion toggle lists to Anki Flashcards fast and easy 😉"					
						<.columns>
							<.column>
								<p> "{<strong[fw: bold]> "notion2Anki"} is 100% free and open source with no limitations on file size 🆓 It's a passion project 🕺🏾💃🏾 We are going to make this a good way to make Anki flashcards easier, better and faster for anyone anywhere around the world 🌎"

								<div[d: flex j: center a: center mt: 2rem]>
									<div[mx: 2rem]>
										<a.button[fw: bold] .is-primary .is-large href="/upload"> "Get Started"
									<a.button.is-light .is-large href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd" target="_blank">
										<span.icon[c: red]>
											<i.fab.fa-youtube>
										<span[fw: bold]> "Tutorials"
							<.column>
								<.has-text-centered>
									<youtube-embed video=pitch inline=false title="Video Tutorial: How to use notion2anki">
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
			<.section>
				<.container>
					<h1.title> "Benefits"
					<hr>
					<p.subtitle> "Stop wasting your time ⏳ Instead of copy pasting or typing in for hours and hours, {<strong> "let notion2anki do it in 10 seconds"}!"
					<p.subtitle> "🆓 This project is 100% free and open source! It will remain free, I promise you that my friend 👌🏾"
					<a[mt: 2rem].button.cta.is-large href="/features"> "Learn more about notion2anki features"
			<.section>
				<.container>
					<h2.title> <a[c: black td: none] href="#usage" name="usage"> "How it\n            works"
					<hr>
					<p.subtitle> "You export your page as a HTML from Notion and then let notion2anki convert it."
					<.has-text-centered>
						<ul>
							<li> "One Notion page is one deck 🙂"
							# <li> "Headings are treated as tags 🏷"
							<li> "One toggle list is one card 🗂"
					<.has-text-centered>
						<a[mt: 2rem].button.cta.is-large href="/upload"> "Get started"
			<.section>
				<.container>
					<h2.title> "Video Tutorial: How to use notion2anki"
					<hr>
					<p.subtitle> "In this video, {<a[c:blue700] href="https://alpkaanaksu.com"> "Alp Kaan"} shows you how to use notion2anki"
					<.has-text-centered>
						<youtube-embed video=tutorial inline=false title="Video Tutorial: How to use notion2anki" inline=false>
						<a[mt: 2rem].button.cta .is-large href="/upload"> "I want to save my time"
