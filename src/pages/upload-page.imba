import '../components/n2a-button'
import '../components/download-modal'
import '../components/n2a-side-bar'
import '../components/n2a-upload-form'

import {iget, iset, viewparam} from '../storage'

tag centered-title
	prop title
	<self>
		<.container[mb: 2rem]>
			<.has-text-centered[max-width: 640px m: 0 auto]>
					<h1.subtitle .is-1[mb: 1rem]> title

tag locally-stored-checkbox
	prop label
	prop key

	<self.field>
		<input$key[mr: 0.2rem] checked=iget(key) .has-background-color type="checkbox" name=key @change.{iset(key, $key.checked)}>
		<label> label

tag upload-page

	prop edd = 'empty-deck-desc'
	prop fontSize = 20

	prop cardTypes = [
		{type: 'cherry', label: "Enable cherry picking using 🍒 emoji", default: false},
		{type: 'tags', label: "Treat strikethrough as tags", default: true},
		{type: 'basic', label: "Basic front and back", default: true},
		{type: 'cloze', label: "Cloze deletion", default: true}, 

		{type: 'enable-input', label: "Treat bold text as input", default: false},
		{type: 'basic-reversed', label: "Basic and reversed", default: false},
		{type: 'reversed', label: "Just the reversed", default: false}
	]
	prop view = 'upload'

	def clickSideBar item		
		window.location.search = "view={item}"
		view = item

	def setup
		# Make sure we get default value
		if not iget('default_set')
			for ct of cardTypes 
				iset(ct.type, ct.default)
			iset('default_set', true)
		view = viewparam() || 'upload'

	def render
		<self[d: block py: 4rem]>
			<.section>
				<.columns>
					<.column>
						<n2a-side-bar[p: 2rem]>
					<.column .is-half>
						switch view
							when 'upload'
								<n2a-upload-form>
							when 'deck-options'											
								<centered-title title="Deck Options">
								<.box>
									<.field> 
										<label.label> "Deck Description"
										<locally-stored-checkbox label="Empty description" key='empty-description'>
									<.field>
										<label.label> "Deck Name"
										<.control>
											<input$input.input[fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" value=iget('deckName') type="text" @change.{iset('deckName', $input.value)}>
							when 'card-options'
								<centered-title title="Card Options">
								<.box> for ct of self.cardTypes
									<p> <locally-stored-checkbox key=ct.type label=ct.label>
							when 'template'
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

						<hr>
						<.has-text-centered>
							<h2.subtitle.is-2> "If you ever get stuck watch the videos below"						
							<p> "If you are busy, watch them in 2x speed and please SMASH the ♥️ LIKE button"
							<iframe width="560" height="315" src="https://www.youtube.com/embed/NLUfAWA2LJI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>						
							<iframe width="560" height="315" src="https://www.youtube.com/embed/BN5DTq2tbsY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>							
							<iframe width="560" height="315" src="https://www.youtube.com/embed/4PdhlNbBqXo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>							
					<.column>
						"Join me live on 💜  {<a target="_blank" href="https://www.twitch.tv/alemayhu"> "Twitch"} every week!"