import '../components/youtube-embed'

tag q-w-a # question-with-answer
	prop question
	prop answer

	def render
		<self[d: block] .box> <div>
				<p> "Q: {question}"
				if answer.match(/youtube.com/)
					<.has-text-centered>
						<youtube-embed title=title video=answer inline=false>
				else 
					<p .tag .is-info> "A: {answer}"

tag faq-page	

	prop notionLink = "https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"
	prop contactAdress = "alexander@alemayhu.com"

	def render
		<self[d: block my: 4rem]>
			<.section>
				<.container>
					<h1.title> <a[c: black td: none] href="#faq" name="faq"> "Frequently Asked Questions"
					<hr>
					<.has-text-centered[mb: 1rem]>
						<p.subtitle> "If you are wondering how to use this, please checkout the YouTube {<a href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd"> "playlist"}"
						<p.subtitle> "I have an unanswered question! Great. I would love to hear it. Send an email to {<a href="mailto:alexander@alemayhu.com"> "alexander@alemayhu.com"} or ask on the {<a href="https://discord.gg/PSKC3uS"> "Discord"}."
					<q-w-a question="How do I do X?" answer="https://www.youtube.com/embed/videoseries?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd" title="Video Playlist: All notion2anki Tutorials">
					<q-w-a question="Will notion2anki be around in the next six years?" answer="Yes, it's an open source project.">
					<q-w-a question="How do I transfer colors, font and backgrounds from Notion into notion2anki?" answer="They are included in the HTML export. Make sure you don't export your page as Markdown.">
					<q-w-a question="Where are the servers running?" answer="DigitalOcean via the Frankfurt datacenter (FRA1) and Netlify for CDN.">
					<q-w-a question="Where are you based?" answer="In the Kingdom of Norway.">
					<q-w-a question="How do I become a successful developer?" answer="Do things and tell people.">
					<q-w-a question="How do I come up with ideas?" answer="Go and read about people's problems on Reddit and solve them.">
					<q-w-a question="What is the goal of notion2anki?" answer="https://www.youtube.com/embed/FjifJG4FoXY" title="Explanation Video: Notion + Anki = 💛">
					<q-w-a question="How do I add images?" answer="https://www.youtube.com/embed/cSFvv3AVtIg" title="Video Tutorial: 🗺Making flashcards with maps using notion2anki 🗾">
					<q-w-a question="What is the 2anki Manifesto?" answer="i) Always create your own decks, no exceptions ❣️ ii) The hard way is always the right and easy way iii) Be a fearless and just do it">