tag youtube-embed

	prop title = "Modal title"
	prop showModal = false
	prop video

	def pressedIcon
		showModal = true

	<self[d: flex fld: column]>
		if showModal
			<.modal[d: flex]>
				<.modal-background>
				<.modal-card>
					<header.modal-card-head>
						<p.modal-card-title[max-width: 95%]> title
						<button.delete aria-label="close" @click.{showModal=false}>
					<section.modal-card-body>
						<.is-video>
							<iframe.self-center src=video allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">
		else
			<.is-video>
				<iframe.self-center src=video allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">