
tag sub-reddit
	prop name
	prop url
	
	<self>
		<.column>		
			<a[bg: #FF5700 c: white] .is-large .tag target="_blank" href=url>
				<span> name

tag useful-links-page	
	prop digitalocean = "https://m.do.co/c/c5a16996cd0e"
	prop skillshare = "https://skl.sh/2WhV7F6"

	def render
		<self[d: block my: 4rem]>
			<.section>
				<.container>
					<h1.title> <a[c: black td: none] href="#useful" name="useful"> "Useful Links"
					<hr>
					<p.subtitle> "Here are some great resources to help you with your learning journey. Happy learning, my friend 🙂"

					<h3[my: 2rem] .title .is-3> "Referrals"
					<hr>
					<p.subtitle> "If you use the links to sign up to {<a href=digitalocean> "DigitalOcean"} or {<a href=skillshare> "Skillshare"} we get a reward 🎁 I am letting you know this for the sake of transparency 😉"
					<.columns>
						<.column>
							<a[bg: #6AB9BE c: white fw: bold] .is-large .tag target="_blank" href=skillshare> "Skillshare"
						<.column>
							<a[bg: #008bcf c: white] .is-large .tag target="_blank" href=digitalocean>
								<span> "DigitalOcean"
					<h3[my: 2rem] .title .is-3> "YouTube"
					<hr>
					<p.subtitle> "YouTube is one of the most underrated education platforms on the planet. Use it wisely and you shall be rewarded 🙂"
					<.columns>
						<.column>
							<a.navbar-item target="_blank" href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ">
								<span.icon[c: red mx: 1rem]>
								<span> "Alexander Alemayhu"
						<.column>
							<a.navbar-item target="_blank" href="https://www.youtube.com/user/MATTvsJapan">
								<span.icon[c: red mx: 1rem]>
								<span> "Matt vs. Japan"
						<.column>
							<a.navbar-item target="_blank" href="https://www.youtube.com/user/Sepharoth64">
								<span.icon[c: red mx: 1rem]>
								<span> "Ali Abdaal"
						<.column>
							<a.navbar-item target="_blank" href="https://www.youtube.com/channel/UC-DExX14VBH75q9Fw7wVbAw">
								<span.icon[c: red mx: 1rem]>
								<span> "Philipp (German)"
					
					<h3[my: 2rem] .title .is-3> "Anki Community"
					<p.subtitle> "The Anki community is huge and diverse. You can find lots of stuff around the web but here are some of the things we recommend you to check out."
					<h4[my: 2rem] .title .is-3> "Reddit"
					<.columns>
						<sub-reddit name="r/notion2anki" url="https://www.reddit.com/r/notion2anki/">
						<sub-reddit name="r/Anki" url="https://www.reddit.com/r/Anki/">
						<sub-reddit name="r/MedicalSchoolAnki" url="https://www.reddit.com/r/medicalschoolanki/">
						<sub-reddit name="r/AnkiLatino" url="https://www.reddit.com/r/AnkiLatino/">	
					
					<h4[my: 2rem] .title .is-3> "Anki"
					<.columns>
						<.column>
							<a[bg: black c: white] .is-large .tag target="_blank" href="https://apps.ankiweb.net/">
								<span> "Anki for Desktop"							
						<.column>
							<a[bg: #a4c639 c: white] .is-large .tag target="_blank" href="https://play.google.com/store/apps/details?id=com.ichi2.anki">
								<span> "Anki for Android"
						<.column>
							<a[bg: black c: white] .is-large .tag target="_blank" href="https://apps.apple.com/us/app/ankimobile-flashcards/id373493387">
								<span> "Anki for IOS"

						<.column>
							<a[bg: black c: white] .is-large .tag target="_blank" href="https://docs.ankiweb.net/#/">
								<span> "Anki Manual"							