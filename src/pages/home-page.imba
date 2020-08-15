import '../components/page-content'
import '../components/youtube-embed'


tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"
	prop tutorial = "https://www.youtube.com/embed/lpC7C9wJoTA"
	prop pitch = "https://www.youtube.com/embed/FjifJG4FoXY"

	css .cta bg: #83C9F5 c: white fw: bold

	def render
		<self[d: block my: 2rem]>
			<section.hero.is-medium>
				<div.hero-body>
					<div.container>
						<h1 .title .is-size-1> "Create better Anki flashcards faster and easier today!"
						<h2.subtitle> "Convert Notion toggle lists to Anki Flashcards fast and easy 😉"					
						<.columns>
							<.column>
								<p> "{<strong[fw: bold]> "notion2Anki"} is 100% free with no limitations on file size 🆓 It's a passion project 🕺🏾💃🏾 We are going to make this a good way to make Anki flashcards easier, better and faster for anyone anywhere around the world 🌎"
								<.has-text-centered>
									<a[mt: 2rem].button.cta .is-large href="/upload"> "Get Started"

							<.column>
								<.has-text-centered>
									<youtube-embed video=pitch inline=false title="Video Tutorial: How to use notion2anki">

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
