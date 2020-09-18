import './youtube-embed'

tag download-modal

	prop title = "Modal title"
	prop showModal = true
	prop downloadLink = null
	prop deckName

	def pressedIcon
		showModal = true

	get navigator do window.navigator
	
	def isNorwegian
		['no', 'nb', 'no-no', 'nb-no', ''].includes(navigator.language.toLowerCase())		

	def patreonIntro
		isNorwegian() ? 'https://www.youtube.com/embed/lbCQuDSbVGI' : 'https://www.youtube.com/embed/EoB_zj7jeEk'
	
	def patreonIntroTitle
		isNorwegian() ? "Pls send penger 🙏🏾" : "Patreon Intro 🧡"		

	<self[d: flex fld: column]>
		if showModal
			<.modal[d: flex]>
				<.modal-background>
				<.modal-card>
					<header.modal-card-head>
						<p.modal-card-title> title
						<button.delete aria-label="close" @click.{showModal=false}>
					<section.modal-card-body>
						<.has-text-centered>
							<a[m: 2rem].button.is-primary href=downloadLink @click.didDownload download=deckName> "Click to Download"
							<h3 .title .is-3> "Support this project"
							<hr>
							<p> "This deck is brought to you by our amazing {<a href="https://www.patreon.com/alemayhu"> "patrons"} 🧡"
							if self.isNorwegian()
								<p[fw: bold]> "Vipps til 401 04 387 (Alexander Alemayhu) 🙏🏾 "
							<youtube-embed video=patreonIntro() title=patreonIntroTitle() inline=false>
							<p.subtitle> "This project is 100% free and will remain free! Please if you have the means you can support this project via these options 🙏🏾"
							<.has-text-centered>
									<a href="https://patreon.com/alemayhu"> <img src="become_a_patron_button.png" alt="Become a Patreon" loading="lazy">
								<.has-text-centered>
									<a.button .is-large href="https://paypal.me/alemayhu"> <span> "Paypal"
								<h4 .title .is-4> "Other Ways to Contribute"
								<p.subtitle> 
									"If you know someone who can benefit from notion2anki, please share it with them. We want to save people time, anywhere in the world 🌎 "
									"If you are missing a feature or format, let us know on {<a href="https://github.com/alemayhu/notion2anki"> "GitHub"} or the {<a href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}."
								<p.subtitle>
									"If you are ready for a challenge then make a video and show people how easy it is to create great flashcards! Remember to send us the link or video file!"
