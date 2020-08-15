tag privacy-page	
	prop doPP = "https://www.digitalocean.com/legal/privacy-policy/"
	prop netlifyPP = "https://www.netlify.com/privacy/"
	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self[d: block my: 4rem]> 
			<.section>
				<.container>
					<h1 .title> "Privacy Protection"
					<hr>
					<p .subtitle .has-text-centered> <strong> "If you have any questions don't hesitate to reach out."						
					<p .subtitle>
						"Some of the file handling is done on an external server to reduce the overhead on your browser. For debugging purposes your cards are logged but not perserved overtime.{<br>}"
					<p .subtitle> "If you have accidentally uploaded anything sensitive, just reach out and I will delete the logs on the server."
					<p .subtitle> "Your IP address is logged on the server and may be used for research purposes. When that is said no personally identifiable information is collected or harvested."
					<p .subtitle>							
						"You can also read the source code at {<a.rounded href="https://github.com/alemayhu/notion2anki" target="_blank"> "alemayhu/notion2anki"}"
					
			<.section>
				<.container>
					<h2 .title .is-2> "Hosting"
					<p.subtitle> "This site is being served via DigitalOcean servers and Netlify CDN."
					<p.subtitle> "You can read their respective privacy policies here: "
					<ul.subtitle>
						<li> <a href=doPP target="_blank">  doPP
						<li> <a href=netlifyPP target="_blank">  netlifyPP

			<.section>
				<.container>
					<h2 .title .is-2> "Error Reporter"
					<p.subtitle> "This site uses {<a href="https://sentry.io"> "Sentry"} for crash reports."
					<p.subtitle> "You can read their Privacy policy here {<a href="https://sentry.io/privacy/" target="_blank"> "https://sentry.io/privacy/"}"

			<.section>
				<.container>
					<h2 .title .is-2> "Analytics"
					<p.subtitle> "In order to better understand the usage (number of visitors) of the site and how to better serve users Google Analytics is used."
					<p.subtitle> "See their privacy policy here {<a href="https://policies.google.com/privacy"> "https://policies.google.com"}"






