tag features-page
	def render
		<self[d: block my: 4rem]>
			<.section>
				<.container>
					<h1.title> "The features supported by notion2anki"
					<hr>
					<h1.title> "Card types"
					<ul>
						<li> <a href="#standard"> "Standard (front and back)"
						<li> <a href="#reversed"> "Reversed"
						<li> <a href="#standard-reversed"> "Standard and reversed"
						<li> <a href="#cloze-support"> "Cloze deletion"
					<h1.title> "Visuals"
					<ul>
						<li> <a href="#images"> "Images"
						<li> <a href="#emoji"> "Emoji"
					<h1.title> "Video"
					<ul>
						<li> <a href="#YouTube"> "YouTube"
					<h1.title> "Audio"
					<ul>
						<li> <a href="#SoundCloud"> "SoundCloud"
						<li> <a href="#mp3"> "MP3 files"
					<h1.title> "Advanced"
					<ul>
						<li> <a href="#math"> "Math"
					<br>
					<p[fs: 16pt]> "✅ Notion styles will automatically be transferred to your decks."
					<p[fs: 16pt]> "⛔ Markdown is {<strong> "not"} supported."
					<hr>
					<h1#standard.title> "Standard cards"
					<p> "Toggle title is the front and the content of the toggle is the back side of the card."
					<h1#reversed.title> "Reversed cards"
					<p> "In reversed cards, the front and back sides are switched. The title of the toggle becomes the back side of the card, while the inner part of the toggle is treated as the front."
					<h1#standard-reversed.title> "Standard and reversed"
					<p> "The deck consists of standard and reversed cards. So you see both of these card types in a deck."
					<h1#cloze-support.title> "Cloze support"
					<p> "Using cloze deletion is a great way for learning things in context. It basically takes a certain part you choose out of a text, so that you can try to recall the missing part. notion2anki treats inline code as cloze. If you need help getting started with creating cloze deletion cards using notion2anki, watch {<a href="https://www.youtube.com/watch?v=r9pPNl8Mx_Q"> "this tutorial"}."
					<hr>
					<h1#images.title> "🖼️ Images"
					<p> "You can include images inside your toggles, they will be on the converted deck. The are great for using mnemonics in your cards. Adding images is explained in {<a href="https://www.youtube.com/watch?v=cSFvv3AVtIg&list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd&index=8"> "this video"}."
					<h1#emoji.title> "😉 Emojis"
					<p> "WE LOVE EMOJIS! 😍 and encourage you to use them. They are a nice visual touch to your cards."
					<hr>
					<h1#YouTube.title> "🎞️ YouTube embed"
					<p> "You can embed YouTube videos in your cards, just put a video in a toggle."
					<hr>
					<h1#SoundCloud.title> "🔊 SoundCloud embed"
					<p> "You can add SoundCloud audio to your cards. Visit {<a href="https://soundcloud.com/"> "SoundCloud's website."}"
					<h1#mp3.title> "🎧 MP3 Files"
					<p> "You can also add MP3 files to your cards. You can watch {<a href="https://www.youtube.com/watch?v=lpC7C9wJoTA"> "this video"} to see it in action."
					<youtube-embed video="https://www.youtube.com/embed/lpC7C9wJoTA" inline=true title="Video Tutorial: How to use notion2anki for learning languages">
					<hr>
					<h1#math.title> "🔢 Math"
					<p> "notion2anki can convert math equations too. Notion uses KaTeX library for inline math and math blocks. Visit {<a href="https://www.notion.so/Math-equations-b4e9e4e03677413481a4910e8bd328c1"> "Notion's official website"} for more information on using math in Notion."
	css ul
		list-style-type: disc
		mb: 1rem
		pl: 2.5em
	css li
		fs: 16pt
	css p
		mb: 3rem