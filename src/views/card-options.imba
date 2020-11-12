import '../components/locally-stored-checkbox'
import '../components/centered-title'

import {getCardTypes} from '../data/card-types'

tag card-options
	prop cardTypes

	def setup
		self.cardTypes ||= getCardTypes!
		console.log(self.cardTypes)

	def render
		<self>
			<centered-title title="Card Options">
			<.box> 
				<.field>
					<label.label> "Toggle Mode" 
					<.control[mt: 1rem].control>
						<div.select.is-medium>
							<.select> 
								<select$toggleMode name="toggle-mode">
									<option value="open_toggle"> "Open nested toggles"
									<option value="close_toggle"> "Close nested toggles"
				for ct of self.cardTypes
					<p> <locally-stored-checkbox key=ct.type label=ct.label value=ct.default>