tag progress-bar

	prop label = null
	prop value = 0
	prop max = 100

	def mount
		window.requestAnimationFrame do step()
		self.lastTime = Date.now()
	
	def oneSecondHasPassed
		Math.round(((Date.now() - self.lastTime) / 1000)) > 0

	def step
		return if value == max
		if oneSecondHasPassed()
			value = value + 1
			imba.commit()
			self.lastTime = Date.now()
		window.requestAnimationFrame do step()

	def render
		<self>
			if label
				<label for="file"> label
			<progress max=max value=value> "{value}%"