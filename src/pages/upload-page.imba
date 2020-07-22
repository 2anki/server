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
			<form[d: flex fld: column jc: start ai: center h: 100%] enctype="multipart/form-data" method="post" action=actionUrl()>
				<input[w: 90% min-height: 48px bdb: 1.5px solid grey fs: 2xl fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" name="deckName" type="text">
				<.select-flip-type[mt: 1rem w: 90% c: black bdb: 1.5px solid grey d: flex jc: space-between].rounded>
					<label[fs: xl] for="flip-mode"> "Flip Mode: "
					<select[fs: xl w: 50%] name="flip-mode">
						<option value="basic"> "Basic front and back"
						<option value="basic-reversed"> "Basic and reversed"
						<option value="reversed"> "Just the reversed"
				<input[m: 10 p: 10 bd: 4px dashed gray600 fs: 2xl] type="file" name="pkg" accept=".zip,.html,.md" required>
				<button[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2 bg: #83C9F5]  type="submit"> "Convert"
			<div[m:4rem]>
				<p[ta: center p: 0 4 fs: xl m: 0 max-width: 500px]> "If you are missing a feature or format, let me know on "
					<a[mr: 0.2rem bg: black @hover: green400].rounded href="https://github.com/alemayhu/notion2anki"> "GitHub"
					"or the "
					<a[bg: #7289da @hover: green400].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"