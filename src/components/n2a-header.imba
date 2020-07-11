import './call-for-action'

tag n2a-header

	def showTheCTA		
		<call-for-action>
			if window.innerWidth <= 600
				<p> "For more tools like this checkout {<a[bg: transparent c: black m: 0 p: 0 td: underline].rounded .underline href="https://2anki.net"> "2Anki.net"} and "
				<p>
					"join the Community on "
					<a[bg: #7289da  @hover: blue].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"
			else
				<p>
					"For more tools like this checkout {<a[mr: 0 bg: blue700  @hover: blue].rounded .underline href="https://2anki.net"> "2Anki.net"} and "
					"join the Community on "
					<a[bg: #7289da @hover: blue].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"

	def render
		<self[d: inline-block]>
			<nav[d: flex jc: space-around w: 100vw c: white ai: center fld: column @md: row].n2a-blue-bg>
				<a[c:white td:none] href="/"> <h1[fs:2xl fw: bold ls: -0.025rem m: 0 p: 0 c: white @hover: blue]> "notion.2anki.net"
				<div[w: 20% js: flex-end]>
					<div[text: xl d: flex jc: space-around]>
						<a.rounded href="/"> "2Anki.net"
						<a.rounded href="/contact"> "Contact"
						<a.rounded href="/privacy"> "Privacy"
			showTheCTA()
		