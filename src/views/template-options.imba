import '../components/centered-title'

tag template-options

	def render
		<self>
			<centered-title title="Template Options">
			<.field .box>
				<label.label> "Template"
				<.control[mt: 1rem].control>
					<.select .is-large>
						<select$template name="template">
							<option value="specialstyle"> "Default"
							<option value="notionstyle"> "Only Notion"
							<option value="nostyle"> "Raw Note (no style)"
			# TODO: store font size in local storage
			<.field .box>
				<label.label> "Font Size" 
				<.control[d: grid jc: start]>
					<div[bd: 1px solid lightgray br: 5px p: 0]>
						<input bind=fontSize name='font-size' hidden>								
						<p> for fontPreset in [32, 26, 20, 12, 10]
								<span[fs: {fontPreset}px p: 3px br: 5px m: 0 8px] [c: #00d1b2]=(fontPreset == fontSize) @click.{fontSize = fontPreset}> "Aa"

			<h2> "TODO: show preview"