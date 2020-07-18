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
			<h2> "Only ZIP, HTML and Markdown uploads (one file per upload)"
			<form[d: flex fld: column jc: start ai: center h: 100%] enctype="multipart/form-data" method="post" action=actionUrl()>
				<input[m: 10 p: 10 bd: 4px dashed gray600 fs: 2xl] type="file" name="pkg" accept=".zip,.html,.md">
				<button[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2]  .n2a-blue-bg  type="submit"> "⬆️ Convert"
