import './components/page-content'
import './components/n2a-button'
import './components/progress-bar'

tag upload-page

	prop state = 'ready'
	prop progress = 0
	prop fontSize = 20
	
	def render
		<self>
			<page-content .justify-center=(state == 'uploading') .items-center=(state == 'uploading')>
				<form enctype="multipart/form-data" method="post" action="http://localhost:9000/.netlify/functions/upload" .flex .flex-col .justify-center .items-center .h-screen>
					if state == 'ready'
						<input$input .m-4 .p-4 .border-dashed .border-4 .border-gray-600 #upload-button type="file" name="pkg" accept=".zip,.html">
						<div .text-center>
							<h2> "Font size: {fontSize}"
							<input[fontSize] name="font-size" min='20' type="range" :change.fontSizeChanged(fontSize)>
							<p #user-font-size css:font-size="{fontSize}px"> "a A あ　ア　万"
						<button :click .text-4xl .font-bold .text-white .n2a-blue-bg .rounded-full .px-8 .py-2 type="submit"> "Download"