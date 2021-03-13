import '../components/input/locally-stored-select'
import '../components/centered-title'

import {iget, iset} from '../data/storage'

tag template-options
	prop fontSize = 20

	prop values = [
		{key: 'specialstyle', label: 'Default'},
		{key: 'notionstyle', label: "Only Notion"},
		{key: 'nostyle', label: "Raw Note (no style)"},
		{key: 'abhiyan', label: "Abhiyan Bhandari (Night Mode)"}
	]

	def setup
		if let fs = iget('font-size')
			fontSize = fs

	def fontSelected fs
		console.log('fs', fs)
		iset('font-size', fs)
		fontSize = fs

	def render
		<self>
			<centered-title title="Template Options">
			<.box>
				<.field>
					<label.label> "Basic Template Name"
					<.control>
						<input$inputBasic.input[fw: bold @placeholder: grey] 
							placeholder="Defaults to n2a-basic"
							value=iget('basic_model_name')
							type="text" @change.{iset('basic_model_name', $inputBasic.value)}>
				<.field>
					<label.label> "Cloze Template Name"
					<.control>
						<input$inputCloze.input[fw: bold @placeholder: grey]
							placeholder="Defaults to n2a-cloze"
							value=iget('cloze_model_name') type="text"
							@change.{iset('cloze_model_name', $inputCloze.value)}>
				<.field>
					<label.label> "Input Template Name"
					<.control>
						<input$inputInput.input[fw: bold @placeholder: grey] 
							placeholder="Defaults to n2a-input"
							value=iget('input_model_name')
							type="text" @change.{iset('input_model_name', $inputInput.value)}>
				<.field>
					<locally-stored-select label="Template" key="template" values=values>
				<.field>
					<label.label> "Font Size" 
					<.control[d: grid jc: start]>
						<div[bd: 1px solid lightgray br: 5px p: 0]>
							<input bind=fontSize name='font-size' hidden>								
							<p> for fontPreset in [32, 26, 20, 12, 10]
									<span[fs: {fontPreset}px p: 3px br: 5px m: 0 8px] [c: #00d1b2]=(fontPreset == fontSize) @click.fontSelected(fontPreset)> "Aa"

			<.box>
				<h2[ta: center]> "Preview support is coming!"
				# <iframe[w: 100% h:  320px w: 256px bd: 3px dashed] src="/templates/preview_custom.html">
