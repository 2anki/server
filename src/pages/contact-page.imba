import '../components/page-content'

tag contact-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self[d: inline-block]> <page-content[jc: start]>
			<div[p: 0 4 d: flex fld: column ai: center max-width: 720px m: 0px auto]>
				<h2[fw: bold fs: 4xl]> <a[c: black td: none] href="#contact" name="contact"> "Contact"
				<div>
				<p[ta: center p: 0 4 fs: xl m: 0.2rem 0]> "The easiest way to reach me is to send an email to {<a[bg: orange600].rounded href="mailto:{contactAdress}"> contactAdress}" 
				<p[ta: center p: 0 4 fs: xl m: 2 0]> "I read my personal inbox every Saturday and see all messages."
			<div[d: flex fld: row mb: 1rem jc: space-between]>
				<iframe src="https://discordapp.com/widget?id=723998078201495642&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0">
				<iframe#chat_embed frameborder="0" scrolling="no" src="https://www.twitch.tv/embed/hebo/chat?parent=streamernews.example.com" height="500" width="350">