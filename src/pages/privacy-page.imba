import '../components/page-content'

tag privacy-page	
	prop doPP = "https://www.digitalocean.com/legal/privacy-policy/"
	prop netlifyPP = "https://www.netlify.com/privacy/"
	prop contactAdress = "alexander@alemayhu.com"

	css h2 fs: 4xl fw: bold
	css div w: 100%

	def render
		<self[d: inline-block]> <page-content>
			<div[w: 100vw d: flex fld: column jc: space-between]>
				<div[py: 4 max-width: 720px m: 0px auto]>
					<div[d: flex fld: column ai: center]>
						<h2[fs: 4xl]>
							<a[td: none c: black] href="#privacy" name="privacy"> "Privacy Protection"

						<p>
							"Some of the file handling is done on an external server to reduce the overhead. For debugging purposes your cards are logged but not perserved overtime.{<br>}"
							"Your IP address is logged on the server and may be used for research purposes. When that is said no personally identifiable information is collected."
						<p>							
							"You can also read the source code at {<a[c: white bg: grey600 @hover:blue].rounded href="https://github.com/alemayhu/notion2anki" target="_blank"> "alemayhu/notion2anki"}"
						
						<div>
							<h2> "Hosting"
							<p> "This site is being served via DigitalOcean servers and Netlify CDN."
							<p> "You can read their respective privacy policies here: "
							<ul>
								<li> <a href=doPP target="_blank">  doPP
								<li> <a href=netlifyPP target="_blank">  netlifyPP

						<div>
							<h2> "Error Reporter"
							<p> "This site uses {<a href="https://sentry.io"> "Sentry"} for crash reports."
							<p> "You can read their Privacy policy here {<a href="https://sentry.io/privacy/" target="_blank"> "https://sentry.io/privacy/"}"

						<div>
							<h2> "Analytics"
							<p> "In order to better understand the usage (number of visitors) of the site and how to better serve users Google Analytics is used."
							<p> "See their privacy policy here {<a href="https://policies.google.com/privacy"> "https://policies.google.com"}"






