# Components
import './components/n2a-header'
import './components/n2a-footer'
import './pages/upload-page'

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

	def mount
		window.onbeforeunload = do
			if state != 'ready'
				return "Conversion in progress. Are you sure you want to stop it?"				
	def render
		<self[d: flex fld: column jc: space-between]>
			<n2a-header>
			<upload-page state=state progress=progress>
			<n2a-footer>
