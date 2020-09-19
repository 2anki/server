tag benefits-page

	css ul
		list-style-type: square
		mb: 1rem
		pl: 2.5em
	css li
		fs: 16pt

	css div py: 1rem

	def render
		<self[d: block]>
			<.section[d: block m: 4rem]> <.container>
				<h1.title> "The benefits you get from using notion2anki 💫"
				<hr>
				<.subtitle .is-4> "✅ All of the Anki note types are supported."
				<ul>
					<li> <a href="#standard-reversed"> "Basic (+reversed)"
					<li> <a href="#reversed"> "Reversed"
					<li> <a href="#standard"> "Basic"
					<li> <a href="#cloze-support"> "Cloze"
				<.subtitle .is-4> "✅ Rich Media support"
				<ul>
					<li> <a href="#SoundCloud"> "SoundCloud"
					<li> <a href="#YouTube"> "YouTube"
					<li> <a href="#mp3"> "MP3 files"
					<li> <a href="#images"> "Images"
					<li> <a href="#emoji"> "Emoji"
					<li> <a href="#math"> "Math"
				<p[fs: 16pt]> "✅ Notion styles will automatically be transferred to your decks."
				<p[fs: 16pt]> "⛔ HTML export is the {<strong> "only"} supported format."
				<div[pt: 1rem]>
					<div>
						<h4 .is-4 #standard.title> "Basic cards"
						<hr>
						<p> "Toggle title is the front and the content of the toggle is the back side of the card."
					<div>
						<h4 .is-4 #reversed.title> "Reversed cards"
						<hr>
						<p> "In reversed cards, the front and back sides are switched. The title of the toggle becomes the back side of the card, while the inner part of the toggle is treated as the front."
					<div>					
						<h4 .is-4 #standard-reversed.title> "Basic and reversed"
						<p> "The deck consists of standard and reversed cards. So you see both of these card types in a deck."
					<div>					
						<h4 .is-4 #cloze-support.title> "Cloze support"
						<hr>
						<p> "Using cloze deletion is a great way for learning things in context. It basically takes a certain part you choose out of a text, so that you can try to recall the missing part. notion2anki treats inline code as cloze. If you need help getting started with creating cloze deletion cards using notion2anki, watch {<a href="https://www.youtube.com/watch?v=r9pPNl8Mx_Q"> "this tutorial"}."					
					<div>						
						<h4 .is-4 #images.title> "🖼️ Images"
						<hr>
						<p> "You can include images inside your toggles, they will be on the converted deck. The are great for using mnemonics in your cards. Adding images is explained in {<a href="https://www.youtube.com/watch?v=cSFvv3AVtIg&list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd&index=8"> "this video"}."
					<div>					
						<h4 .is-4 #emoji.title> "😉 Emojis"
						<hr>
						<p> "We encourage the usage of emojis 😍They are a nice visual touch to your cards."					
					<div>
						<h4 .is-4 #YouTube.title> "🎞️ YouTube embed"
						<hr>
						<p> "You can embed YouTube videos in your cards, just add the YouTube link and it will be embedded."

					<div>					
						<h4 .is-4 #SoundCloud.title> "🔊 SoundCloud embed"
						<hr>
						<p> "You can add SoundCloud audio to your cards. Just in a link from the {<a href="https://soundcloud.com/"> "SoundCloud's website."} and it will create embed for you."

					<div>					
						<h4 .is-4 #mp3.title> "🎧 MP3 Files"
						<hr>
						<p> "You can also add MP3 files to your cards. You can watch {<a href="https://www.youtube.com/watch?v=lpC7C9wJoTA"> "this video"} to see it in action."
						<youtube-embed video="https://www.youtube.com/embed/lpC7C9wJoTA" inline=true title="Video Tutorial: How to use notion2anki for learning languages">

					<div>					
						<h4 .is-4 #math.title> "🔢 Math"
						<hr>
						<p> "notion2anki can convert math equations too. Notion uses KaTeX library for inline math and math blocks. Visit {<a href="https://www.notion.so/Math-equations-b4e9e4e03677413481a4910e8bd328c1"> "Notion's official website"} for more information on using math in Notion."