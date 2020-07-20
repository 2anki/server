import '../components/page-content'
import '../components/n2a-button'
import '../components/progress-bar'

tag upload-page

	prop state = 'ready'
	prop progress = 0
	prop fontSize = 20
	
	def isDebug
		window.location.hostname == 'localhost'

	def actionUrl
		let baseUrl = isDebug() ? "http://localhost:2020" : "https://notion.2anki.com"
		"{baseUrl}/f/upload"

	def render
		<self[d: inline-block]> <page-content>
			<div[d: flex fld: column a: center pb: 2rem bg: yellow200 px: 4]>
				<p[fs: sm]> "This project is 100% free and will remain free but please considering supporting it by"
				<div>
					<a.patreon-button href="https://www.patreon.com/ccscanf" patreon-widget-type="become-patron-button"> "Become a Patron!"
			<strong[fs: xl]> "Only ZIP, HTML and Markdown uploads"
			<p> "Make your style changes for Markdown below."
			<form[d: flex fld: column jc: start ai: center h: 100%] enctype="multipart/form-data" method="post" action=actionUrl()>
				<h2[m: 0 p: 0]> "⚙️ Style Setting"			
				<div[bg: gray400 br: 0.3rem p: 4 m: 0 6 6 6 w: 80% h: 50% d: flex jc: center fld: column ai: center]>
					<div>
						<p>  "Font size: {fontSize}"
						<input$file bind=fontSize name="font-size" min='20' type="range">
						<p[fs: {fontSize}px]> "a A あ　ア　万"
				<input[m: 10 p: 10 bd: 4px dashed gray600 fs: 2xl] type="file" name="pkg" accept=".zip,.html,.md">
				<button[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2]  .n2a-blue-bg  type="submit"> "⬆️ Convert"
