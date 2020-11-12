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
			<.box> for ct of self.cardTypes
				<p> <locally-stored-checkbox key=ct.type label=ct.label value=ct.default>