# import {iget, iset} from '../data/storage'
# # <input$input.input[fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" value=iget('deckName') type="text" @change.{iset('deckName', $input.value)}>

import {iget, iset} from '../../data/storage'

tag locally-stored-select
	prop label
	prop key
	prop value = null
	prop values

	def setup
		if value === null
			value = iget(key)

	def clicked event
		const target = event.target
		iset(key, target.value)
		value = target.value
		self

	def render
		<self.field>
			<.field>
				<label.label> label
				<.control[mt: 1rem].control>
					<.select .is-large>
						<select value=value name=key @change.clicked>
							for v in values
								<option selected=(v.key == value) value=v.key> v.label
