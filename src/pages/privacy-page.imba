import '../components/page-content'

tag privacy-page	

	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self[d: inline-block]> <page-content>
			<div[w: 100vw d: flex fld: column jc: space-between]>
				<div[py: 4 max-width: 720px m: 0px auto]>
					<div[d: flex fld: column ai: center]>
						<h2[fs: 4xl]>
							<a[td: none c: black] href="#privacy" name="privacy"> "Privacy Protection"

						<p[py: 2 fs: xl]>
							"Some of the file handling is done on an external server to reduce the overhead. For debugging purposes your cards are logged but not perserved overtime."
						<p[py: 2 fs: xl]>							
							"You can also read the source code at {<a[c: white bg: grey600 @hover:blue].rounded href="https://github.com/alemayhu/notion2anki" target="_blank"> "alemayhu/notion2anki"}"
						
						<div>
							<h2[fs: 4xl]> "Hosting"
							<p[py: 2 fs: xl]> "This site is being served via {<a href="https://digitalocean.com"> "DigitalOcean"} servers"
							<p[py: 2 fs: xl]> "You can read their Privacy policy here {<a[c: blue600] href="https://www.digitalocean.com/legal/privacy-policy/" target="_blank">  "https://www.digitalocean.com/legal/privacy-policy/"}"

						<div[w: 100%]>
							<h2[fs: 4xl]> "Error Reporter"
							<p[py: 2 fs: xl]> "This site uses {<a href="https://sentry.io"> "Sentry"} for crash reports."
							<p[py: 2 fs: xl]> "You can read their Privacy policy here {<a[c: blue600] href="https://sentry.io/privacy/" target="_blank"> "https://sentry.io/privacy/"}"

						<div>
							<h2[fs: 2xl fw: bold]> "Analytics"
							<p[py:2 fs: xl]> "In order to better understand the usage (number of visitors) of the site and how to better serve users Google Analytics is used."
							<p[py:2 fs: xl]> "See their privacy policy here {<a[c: blue600] href="https://policies.google.com/privacy"> "https://policies.google.com"}"






