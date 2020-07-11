import '../components/page-content'

tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self[d: inline-block]> <page-content>
			<div>
				<div[py: 6 ta: center fs: xl]>
					<p> "Convert Notion {<a[c: blue700] href=notionLink> "Toggle lists"} to Anki cards. Image support is included 😉"                    					
					# TODO: figure out why the email is not showing up
					<p[ta: center p: 0 4 fs: xl m: 0.2rem 0]> 
						"Please report any bugs you experience to {<a[bg: orange600].rounded href="mailto:{contactAdress}"> contactAdress}"
				<div[h: 8rem d: flex ai: center jc: center]>
					<a[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2 td: none].n2a-blue-bg href="/upload.html"> "Upload Notion export"
				<div[d: flex fld: column ai: center]>
					<h2[fw: bold fs: 4xl]>
						<a[ c: black td: none] href="#usage" name="usage"> "How it\n            works"
					<ul[fs: 1.75rem]>
						<li> "One Notion page is one deck 🙂"
						<li> "Headings are treated as tags 🏷"
					<iframe.self-center width="560" height="315" src="https://www.youtube.com/embed/b3eQ0exhdz4" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture">




