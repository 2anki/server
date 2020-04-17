export default class ExpressionHelper

	static def isMarkdown name
		name.match(/\.md$/)
	
	static def suffix input
		input.match(/\.[0-9a-z]+$/i)[0]

	static def imageMatch input
		input.match(/(?:__|[*#])|\[(.*?)\]\(.*?\)/)	

	static def titleMatch input
		input.match(/#.*\n/)
	
	static def isToggleList input
		input.match(/^-/)
	
	static def cleanToggleName input
		input.replace(/^-\s?/, '')

	static def cleanTitle input
		input.replace(/#\s?/, '')