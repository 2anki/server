import {iget, iset} from '../../data/storage'

tag locally-stored-checkbox
	prop label
	prop key
	prop value = null

	def setup
		# The default is null so check for persisted value
		if value === null
			value = iget(key)

	def clicked event
		const target = event.target
		iset(key, target.checked)
		value = target.checked
		self

	def render
		<self.field>
			<input[mr: 0.2rem] checked=(value != 'false') .has-background-color type="checkbox" name=key @change.clicked>
			<label> label