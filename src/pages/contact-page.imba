import '../components/page-content'

tag contact-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self[d: inline-block]> <page-content>
				<div[p: 0 4 d: flex fld: column ai: center max-width: 720px m: 0px auto]>
					<h2[fw: bold fs: 4xl]> <a[c: black td: none] href="#contact" name="contact"> "Contact"
					<div>
					<p[ta: center p: 0 4 fs: xl m: 0.2rem 0]> "The easiest way to reach me is to send an email to {<a[bg: orange600].rounded href="mailto:{contactAdress}"> contactAdress}" 
					<p[ta: center p: 0 4 fs: xl m: 2 0]> "I read my personal inbox every Saturday and see all messages."
					<p[ta: center p: 0 4 fs: xl m: 0]>
						"Currently only the Markdown and HTML format is supported."
						"If you are missing a feature or format, let me know on "
						<a[mr: 0.2rem bg: black  @hover: blue].rounded href="https://github.com/alemayhu/notion2anki"> "GitHub"
						"or the "
						<a[bg: #7289da  @hover: blue].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"




