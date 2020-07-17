import '../components/page-content'

tag contact-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	css p ta: center p: 0 4 fs: xl m: 2 0

	def render
		<self[d: inline-block]> <page-content[jc: start]>
			<h2[fw: bold fs: 4xl]> <a[c: black td: none] href="#contact" name="contact"> "Contact"
			<p[tm: 0.2rem 0]> "The easiest way to reach me is to send an email to {<a[bg: orange600].rounded href="mailto:{contactAdress}"> contactAdress}" 
			<p> "I read my personal inbox every Saturday and see all messages."
			<p> "I live stream weekly my Twitch Channel {<a[bg: purple c: white br: 0.3rem p: 1 3 td: none] href="https://www.twitch.tv/ccscanf"> "ccscanf"}, come by sometime 😉"
			<iframe src="https://discordapp.com/widget?id=723998078201495642&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0">