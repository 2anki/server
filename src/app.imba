# Components
import './components/call-for-action'
import './components/n2a-header'
import './components/footer'
import './upload-page'

css body d: flex fld:  column jc: space-between height: 100vh m: 0 ff: 'Baloo 2'

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
		<self>
			<n2a-header>
			<call-for-action>
				<p> 
					"For more tools like this checkout {<a[bg: blue700 px: 2 c: white mr: 1 border-radius: 0.25rem td: none] .underline href="https://2anki.net"> "2Anki.net"} and "
					"join the Community on "
					<a[bg: #7289da px: 2 c: white mr: 4 border-radius: 0.25rem td: none] href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"
			<upload-page state=state progress=progress>
			<n2a-footer>
