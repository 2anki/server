import {iget, iset} from '../data/storage'

import '../components/centered-title'

tag deck-options
	
	def render
		<self>
			<centered-title title="Deck Options">
			<.box>
				<.field> 
					<label.label> "Deck Description"
					<locally-stored-checkbox label="Empty description" key='empty-description'>
				<.field>
					<label.label> "Deck Name"
					<.control>
						<input$input.input[fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" value=iget('deckName') type="text" @change.{iset('deckName', $input.value)}>
