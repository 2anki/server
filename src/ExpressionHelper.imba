export default class ExpressionHelper

	static def isMarkdown name
		name.match(/\.md$/)
	
	static def suffix input
		input.match(/\.[0-9a-z]+$/i)[0]

	static def imageMatch input
		// https://stackoverflow.com/questions/44227270/regex-to-parse-image-link-in-markdown
		input.match(/!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/)	

	static def titleMatch input
		input.match(/#.*\n/)
	
	static def isToggleList input
		input.match(/^-/)
	
	static def cleanToggleName input
		input.replace(/^-\s?/, '')

	static def cleanTitle input
		input.replace(/#\s?/, '')