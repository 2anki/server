import '../components/page-content'

tag upload-button
	prop text = "Upload Notion export"
	<self>
		<div[h: 8rem d: flex ai: center jc: center]>
			<a[fs: 4xl fw: bold c: white br: 0.25rem px: 8 py: 2 td: none bg: #83C9F5 @hover: green400] href="/upload"> text

tag home-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	prop tutorial = "https://www.youtube.com/embed/b3eQ0exhdz4"

	def render
		<self[d: inline-block]> <page-content>
			<div>
				<div[pt: 6 ta: center]>
					<p[fs: 3xl]> "Convert Notion {<a[c: blue700] href=notionLink> "Toggle lists"} to Anki cards fast and easy 😉"
				<upload-button>
				<div[d: flex fld: column ai: center]>
					<h2[fw: bold fs: 4xl]>
						<a[ c: black td: none] href="#usage" name="usage"> "How it\n            works"
					<p[ta: center p: 0 4 fs: 2xl m: 0 max-width: 500px]> "You export your page as a HTML from Notion and then let notion2anki convert it."
					<ul[fs: 1.75rem]>
						<li> "One Notion page is one deck 🙂"
						# <li> "Headings are treated as tags 🏷"
						<li> "One toggle list is one card 🗂"
					<h3> <a[fs: xl] href=tutorial> "Tutorial: Creating Anki Decks from Notion Toggle Lists"
					<iframe.self-center width="560" height="315" src=tutorial allowFullScreen="allowFullScreen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen;">
				<upload-button text="Get Started">