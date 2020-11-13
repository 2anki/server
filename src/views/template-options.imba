import '../components/input/locally-stored-select'
import '../components/centered-title'

import {iget, iset} from '../data/storage'

tag template-options
	prop fontSize = 20

	prop values = [
		{key: 'specialstyle', label: 'Default'},
		{key: 'notionstyle', label: "Only Notion"},
		{key: 'nostyle', label: "Raw Note (no style)"}
	]

	def setup
		if let fs = iget('font-size')
			fontSize = fs

	def fontSelected fs
		iset('font-size', fs)
		fontSize = fs

	def render
		<self>
			<centered-title title="Template Options">
			<.box>
				<.field>
					<locally-stored-select label="Template" key="template" values=values>
				<.field>
					<label.label> "Font Size" 
					<.control[d: grid jc: start]>
						<div[bd: 1px solid lightgray br: 5px p: 0]>
							<input bind=fontSize name='font-size' hidden>								
							<p> for fontPreset in [32, 26, 20, 12, 10]
									<span[fs: {fontPreset}px p: 3px br: 5px m: 0 8px] [c: #00d1b2]=(fontPreset == fontSize) @click.fontSelected(fontPreset)> "Aa"

			<.box[bg: purple1]>
				<h2> "Preview support is coming!"