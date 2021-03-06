tag home-page

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"
	prop tutorial = "https://www.youtube.com/embed/NLUfAWA2LJI"
	prop githubSponsor = "https://github.com/sponsors/alemayhu"
	prop patreon = "https://patreon.com/alemayhu"

	css .cta bg: #83C9F5 c: white fw: bold
	css .column m: 16px

	def mascotImage
		const index = Math.round(Math.random() * 4)
		"mascot/Notion {index + 1}.png"

	def render
		<self[d: block my: 1rem]>
			<section.hero.is-large>
				<div.hero-body>
					<div.container>
						<.has-text-centered>
								<img[height: 500px object-fit: contain] src=mascotImage! alt="Mascot image" loading="lazy">
								<h1 .title .is-size-1> "Convert Notion  to Anki Flashcards ✨"
								<p.subtitle .is-size-2> "We are making it the easiest and fastest way to create beautiful  Anki flashcards for anyone anywhere around the world 🌎"
								<a.button[fw: bold bg: rgb(207, 83, 89) c: white] .is-large href="/upload"> "Get Started"
								<p> "Fast, simple, easy and 100% {<span[fw: bold td: underline tdc: green3]> "Free"}. It's a passion project 🕺🏾💃🏾"
