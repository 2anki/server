import '../components/page-content'

tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	prop tutorial = "https://www.youtube.com/embed/b3eQ0exhdz4"

	def render
		<self[d: inline-block]> <page-content>
			<div>
				<div[py: 6 ta: center fs: xl]>
					<p> "Convert Notion {<a[c: blue700] href=notionLink> "Toggle lists"} to Anki cards. Image support is included 😉"                    					
					# TODO: figure out why the email is not showing up
					<p[ta: center p: 0 4 fs: xl m: 0.2rem 0]> 
						"Please report any bugs you experience to {<a[bg: orange600 @hover: green400].rounded href="mailto:{contactAdress}"> contactAdress}"
				<div[h: 8rem d: flex ai: center jc: center]>
					<a[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2 td: none bg: #3B83F7 @hover: green400] href="/upload"> "Upload Notion export"
				<div[d: flex fld: column ai: center]>
					<h2[fw: bold fs: 4xl]>
						<a[ c: black td: none] href="#usage" name="usage"> "How it\n            works"
					<p[ta: center p: 0 4 fs: xl m: 0 max-width: 500px]> "Currently only the Markdown and HTML format is supported."
					<p[ta: center p: 0 4 fs: xl m: 0 max-width: 500px]> "If you are missing a feature or format, let me know on "
						<a[mr: 0.2rem bg: black @hover: green400].rounded href="https://github.com/alemayhu/notion2anki"> "GitHub"
						"or the "
						<a[bg: #7289da @hover: green400].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"
					<ul[fs: 1.75rem]>
						<li> "One Notion page is one deck 🙂"
						<li> "Headings are treated as tags 🏷"
					<a[fs: xl] href=tutorial> "Tutorial: Creating Anki Decks from Notion Toggle Lists"
					<iframe.self-center width="560" height="315" src=tutorial allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">




