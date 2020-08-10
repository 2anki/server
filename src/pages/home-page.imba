import '../components/page-content'
import '../components/youtube-embed'
tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	prop tutorial = "https://www.youtube.com/embed/lpC7C9wJoTA"

	css .cta bg: #83C9F5 c: white fw: bold

	def render
		<self>
			<.section>
				<.container>
					<h1[fs: 2.2rem @md: 4.6rem fw: bold c: black]> "From Notion toggle list to Anki Cards easily!"
					<.has-text-centered>
						<p[fs: 1.25rem lh: 1.5]> "Convert Notion {<a[c: blue700] href=notionLink> "Toggle lists"} to Anki cards fast and easy 😉"
					<.has-text-centered>
						<a[mt: 2rem].button.cta .is-large href="/upload"> "Upload Notion export"
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
						<a href=tutorial> tutorial
						<youtube-embed video=tutorial>
						<a[mt: 2rem].button.cta .is-large href="/upload"> "I want to save my time"
