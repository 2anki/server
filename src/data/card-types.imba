import {iget} from './storage'

export def getCardTypes
	return [
		{type: 'cherry', label: "Enable cherry picking using 🍒 emoji", default: iget('cherry') || false},
		{type: 'tags', label: "Treat strikethrough as tags", default: iget('tags') || true},
		{type: 'basic', label: "Basic front and back", default: iget('basic') || true},
		{type: 'cloze', label: "Cloze deletion", default: iget('cloze') || true}, 

		{type: 'enable-input', label: "Treat bold text as input", default: iget('enable-input') || false},
		{type: 'basic-reversed', label: "Basic and reversed", default: iget('basic-reversed') || false},
		{type: 'reversed', label: "Just the reversed", default: iget('reversed') || false}
	]