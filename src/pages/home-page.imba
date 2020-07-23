import '../components/page-content'

tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	prop tutorial = "https://www.youtube.com/embed/b3eQ0exhdz4"

	css .cta bg: #83C9F5 c: white fw: bold

	def render
		<self>
			<.section>
				<.container>
					<h1.title> "Go from Notion toggle list to Anki Cards easily!"
					<hr>
					<p .subtitle> "Convert Notion {<a[c: blue700] href=notionLink> "Toggle lists"} to Anki cards fast and easy 😉"
					<.has-text-centered>
						<a[mt: 2rem].button.cta .is-large href="/upload"> "Upload Notion export"
			<.section>
				<.container>
					<h1.title> "Benefits ✅ "
						<hr>
						<div>
							<span .tag .is-info .is-large> "100% Free"
							<span> " "
							<span .tag .is-warning .is-large> "Emoji support"
							<span> " "
							<span .tag .is-danger .is-large> "YouTube embeds"
							<span> " "
							<span .tag .is-large> "Images and More!"
			<.section>
				<.container>
					<h2.title> <a[c: black td: none] href="#usage" name="usage"> "How it\n            works"
					<hr>
					<p.subtitle> "You export your page as a HTML from Notion and then let notion2anki convert it."
					<.has-text-centered>
						<ul[fs: 1.75rem]>
							<li> "One Notion page is one deck 🙂"
							# <li> "Headings are treated as tags 🏷"
							<li> "One toggle list is one card 🗂"
					<.has-text-centered>
						<a[mt: 2rem].button.cta.is-large href="/upload"> "Get started"
			<.section>
				<.container>
					<h2.title> "Video Tutorial: Creating Anki Decks from Notion Toggle Lists"
					<hr>
					<p.subtitle> "In this video, I show you how to use notion2anki"
					<.has-text-centered>
						<iframe.self-center width="80%" height="315" src=tutorial allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">						
						<a[mt: 2rem].button.cta .is-large href="/upload"> "I want to save mye time"