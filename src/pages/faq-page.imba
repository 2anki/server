import '../components/page-content'

tag q-w-a # question-with-answer
	prop question
	prop answer

	def render
		<self[d: block] .box> <div[fs: xl]>
				<p> "Q: {question}?"
				<p> "A: {answer}"

tag faq-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self>
			<.section>
				<.container>
					<h1.title> <a[c: black td: none] href="#faq" name="faq"> "Frequently Asked Questions"
					<hr>
					<.has-text-centered[mb: 1rem]>
						<p.subtitle> "If you are wondering how to use this, please checkout the YouTube {<a href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd"> "playlist"}"
					<q-w-a question="Will notion2anki be around in the next six years" answer="Yes, it's a open source project.">
					<q-w-a question="How do I get colors, font and backgrounds" answer="Use the HTML export instead of Markdown.">
					<q-w-a question="Where are the servers running" answer="DigitalOcean via the Frankfurt datacenter (FRA1) and Netlify for CDN.">
					<q-w-a question="Where are you based" answer="In the Kingdom of Norway.">
					<q-w-a question="How do I become a successful developer" answer="Do things and tell people.">
					<q-w-a question="How do I come up with ideas" answer="Go and read about people's problems on Reddit and solve them.">