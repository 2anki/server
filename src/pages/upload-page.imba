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
			<form[d: flex fld: column jc: center ai: center] enctype="multipart/form-data" method="post" action=actionUrl()>
				<h2> "⚙️ Style Setting"
				<h3> "Font size: {fontSize}"
				<input$file bind=fontSize name="font-size" min='20' type="range">
				<p[fs: {fontSize}px]> "a A あ　ア　万"
				<strong[fs: xl]> "Only ZIP, HTML and Markdown uploads"
				<input[m: 10 p: 10 bd: 4px dashed gray600 fs: 2xl] type="file" name="pkg" accept=".zip,.html,.md">
				<button[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2]  .n2a-blue-bg  type="submit"> "⬆️ Convert"
