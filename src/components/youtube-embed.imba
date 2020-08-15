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
						<p.modal-card-title> title
						<button.delete aria-label="close" @click.{showModal=false}>
					<section.modal-card-body>
									<iframe.self-center width="80%" height="315" src=video allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">
		elif inline
			<a href=video target="_target"> title
			<button[c: red bg: transparent p: 2] @click.pressedIcon>
				<span.icon>
					<i .fa-2x .fab.fa-youtube>
		else
			<iframe.self-center width="80%" height="315" src=video allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">