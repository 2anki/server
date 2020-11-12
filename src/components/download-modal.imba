import './youtube-embed'

tag download-modal

	prop title = "Modal title"
	prop showModal = true
	prop downloadLink = null
	prop deckName

	def pressedIcon
		showModal = true

	get navigator do window.navigator
	

	def patreonIntro
		'https://www.youtube.com/embed/EoB_zj7jeEk'
	
	def patreonIntroTitle
		"Patreon Intro 🧡"		

	def hideModal
		window.location.href = "/upload"

	<self[d: flex fld: column]>
		if showModal
			<.modal[d: flex]>
				<.modal-background>
				<.modal-card>
					<header.modal-card-head>
						<p.modal-card-title> title
						<button.delete aria-label="close" @click.hideModal().dismissedModal()>
					<section.modal-card-body>
						<.has-text-centered>
							<a[m: 2rem fw: bold].button.is-primary href=downloadLink download=deckName> "Download"
							<hr>
							<h3.title .is-3> "Please Support Open Source 🙏🏾"
							<p> "You can directly support the development and accelerate the improvements!"
							<p> "Pick your price ranging from {<strong> "$1"}, {<strong> "$2"}, {<strong> "$5"}, {<strong> "$14"} and {<strong> "$100"}."
							<p> "This deck is brought to you by our amazing {<a href="https://www.patreon.com/alemayhu"> "patrons"} 🤩"
							<div[p: 1rem mx: 1rem]>
								<a target="_blank" href="https://www.patreon.com/alemayhu">
									<img src="become_a_patron_button.png">
