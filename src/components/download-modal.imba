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
							<p> "This deck is brought to you by our amazing {<a href="https://www.patreon.com/alemayhu"> "patrons"} 🧡"
							if self.isNorwegian()
								<p[fw: bold]> "Vipps til 401 04 387 (Alexander Alemayhu) 🙏🏾 "
							<a[m: 2rem].button.is-primary href=downloadLink @click.didDownload download=deckName> "Click to Download"
							<youtube-embed video=patreonIntro() title=patreonIntroTitle() inline=false>
							<.has-text-centered>
								<a.button[bg: rgb(232, 91, 70) c: white border-radius: 0.3rem] target="_blank" href="https://www.patreon.com/alemayhu">
									<span .icon .is-large>
										<i.fab.fa-patreon>
									<span[tt: uppercase fw: bold]> "Become a Patron"							
