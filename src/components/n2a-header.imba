import './call-for-action'

tag n2a-header

	def showTheCTA		
		<call-for-action>
			if window.innerWidth <= 600
				<p> "Join the Community on {<a[bg: #7289da  @hover: blue].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}"
			else
				<p>
					"Join the Community on {<a[bg: #7289da @hover: blue].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}"

	def render
		<self[d: block flex-shrink: 0]>
			<nav[d: flex jc: space-around w: 100vw c: white ai: center fld: column @md: row].n2a-blue-bg>
				<a[c:white td:none] href="/" target="_blank"> <h1[fs:2xl fw: bold ls: -0.025rem m: 0 p: 0.5rem 1rem c: #1E1D1C bg: #FCF4A7 @hover: blue]> "notion2anki"
				<div[w: 20% js: flex-end]>
					<div[text: xl d: flex jc: space-around]>
						<a.rounded target="_blank" href="/faq"> "FAQ"
						<a.rounded href="/contact"> "Contact"
						<a.rounded href="/privacy"> "Privacy"
			showTheCTA()
		
