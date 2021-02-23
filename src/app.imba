# Components
import './components/n2a-header'
import './components/n2a-footer'
import './pages/upload-page'
import './pages/home-page'

tag app-root
	prop state = 'ready'
	# TODO: expose more card template stuff
	css .rounded border: 0.1px solid white br: 0.25rem td: none  p: 0.1rem 2 my: 2 c: white mr: 4 bg: none  	

	def page
		window.location.pathname

	def mount
		window.onbeforeunload = do
			if state != 'ready'
				return "Conversion in progress. Are you sure you want to stop it?"				
	def render
		<self[d: flex fld: column jc: space-between h: 100vh]>
			<n2a-header[fls: 0]>
			if page().includes('upload')
				<upload-page[fl: 1 0 auto] state=state progress=progress>
			else
				<home-page>
			<n2a-footer[fls: 0]>
