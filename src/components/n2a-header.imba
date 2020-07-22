import './call-for-action'

tag n2a-header

	css h1 fs:2xl fw: bold ls: -0.025rem m: 0 p: 0.5rem 1rem c: #1E1D1C bg: #FCF4A7 @hover: green400
	css p p: 0 m: 0.5rem

	css .nav-link c: white p: 0.1rem 0.5rem m: 0.5rem 1rem 0.5rem 0 td: none ls: 2px fs: xl

	def showTheCTA		
		<call-for-action>
			if window.innerWidth <= 600
				<p> "Join the Community on {<a[bg: #7289da @hover: green400].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}"
			else
				<p>
					"Join the Community on {<a[bg: #7289da @hover: green400].rounded href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}"

	def render
		<self[d: block flex-shrink: 0]>
			<nav[bg: #83C9F5 d: flex jc: space-around w: 100vw c: white ai: center fld: column @md: row]>
				<a[c:white td:none] href="/" target="_blank"> <h1> "notion2anki"
				<div[w: 20% js: flex-end]>
					<div[text: xl d: flex jc: space-around]>
						<a.nav-link target="_blank" href="/faq"> "FAQ"
						<a.nav-link href="/contact"> "Contact"
						<a.nav-link href="/privacy"> "Privacy"
			showTheCTA()
		
