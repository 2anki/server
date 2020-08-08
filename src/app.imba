# Components
import './components/n2a-header'
import './components/n2a-footer'
import './pages/upload-page'
import './pages/home-page'
import './pages/contact-page'
import './pages/privacy-page'
import './pages/faq-page'
import './pages/features-page'

tag app-root
	prop state = 'ready'
	# TODO: expose more card template stuff
	prop settings = {'font-size': 20}

	css .rounded border: 0.1px solid white br: 0.25rem td: none  p: 0.1rem 2 my: 2 c: white mr: 4 bg: none  	


	def page
		window.location.pathname

	def mount
		window.onbeforeunload = do
			if state != 'ready'
				return "Conversion in progress. Are you sure you want to stop it?"				
	def render
		<self>
			<n2a-header>
			if page().includes('upload')
				<upload-page state=state progress=progress>
			elif page().includes('features')
				<features-page>
			elif page().includes('contact')
				<contact-page>
			elif page().includes('privacy')
				<privacy-page>
			elif page().includes('faq')
				<faq-page>
			else
				<home-page>
			<n2a-footer>
