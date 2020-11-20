# Components
import './components/n2a-header'
import './components/n2a-footer'
import './pages/upload-page'
import './pages/home-page'
import './pages/contact-page'
import './pages/privacy-page'
import './pages/faq-page'
import './pages/benefits-page'
import './pages/useful-links'

tag app-root
	prop state = 'ready'
	# TODO: expose more card template stuff
	# TODO: use local storage
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
			elif page().includes('benefits')
				<benefits-page>
			elif page().includes('contact')
				<contact-page>
			elif page().includes('privacy')
				<privacy-page>
			elif page().includes('faq')
				<faq-page>
			elif page().includes('links')
				<useful-links-page>
			else
				<home-page>
			<div[bg: purple1 p: 1.5rem bd: 2.3px solid purple7 bs: inset w: 50vw m: 0 auto mb: 1rem ta: center]>
				<p>
					"Join me live on 💜 Twitch every week!"
				<div[m: 1.3rem]>
					<a[m: 2rem bg: #a970ff c: white p: 0.34rem rd: 0.3rem bg@hover: purple7 fw: bold] target="_blank" href="https://www.twitch.tv/alexanderalemayhu"> "Twitch.tv"
			<n2a-footer>
