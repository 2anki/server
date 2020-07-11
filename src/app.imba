# Components
import './components/n2a-header'
import './components/n2a-footer'
import './pages/upload-page'
import './pages/home-page'
import './pages/contact-page'

css .rounded border: 0.1px solid white br: 0.25rem td: none  p: 0.1rem 2 my: 2 c: white mr: 4 bg: none  @hover: blue	
css body height: 100vh w: 100vw m: 0 ff: 'Baloo 2', Helvetica, Arial

css .app-root
	m: 0
	p: 0
	width: 100vw
	height: 100vh

css .n2a-blue-bg bg: #3B83F7
css .n2a-blue-bg c: #3B83F7

tag app-root
	prop state = 'ready'
	# TODO: expose more card template stuff
	prop settings = {'font-size': 20}

	def page
		window.location.pathname

	def mount
		window.onbeforeunload = do
			if state != 'ready'
				return "Conversion in progress. Are you sure you want to stop it?"				
	def render
		<self[d: flex fld: column jc: space-between]>
			<n2a-header>
			if page().includes('upload')
				<upload-page state=state progress=progress>
			elif page().includes('contact')
				<contact-page>
			else
				<home-page>
			<n2a-footer>
