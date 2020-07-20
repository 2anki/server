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
			<div[d: flex fld: column a: center bg: yellow200 px: 4]>
				<p[fs: sm]> "This project is 100% free and will remain free but please considering supporting it by"
				<div>
					<a[fw: bold].patreon-button href="https://www.patreon.com/ccscanf" patreon-widget-type="become-patron-button"> "Become a Patron"					
			<h2> "Only ZIP, HTML and Markdown uploads (one file per upload)"
			<form[d: flex fld: column jc: start ai: center h: 100%] enctype="multipart/form-data" method="post" action=actionUrl()>
				<input[m: 10 p: 10 bd: 4px dashed gray600 fs: 2xl] type="file" name="pkg" accept=".zip,.html,.md">
				<button[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2]  .n2a-blue-bg  type="submit"> "⬆️ Convert"
