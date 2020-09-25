tag youtube-embed

	prop title = "Modal title"
	prop showModal = false
	prop inline = false	
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
		elif inline
			<a href=video target="_target"> title
			<div>
				<button[c: white rd: 0.3rem bg: red p: 2 cursor: pointer] @click.pressedIcon> "Click for Video"
		else
			<.is-video>
				<iframe.self-center src=video allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">