export default class ExpressionHelper

	static def isMarkdown name
		name.match(/\.md$/)
	
	static def suffix input
		input.match(/\.[0-9a-z]+$/i)[0]

	static def imageMatch input
		// Below does not work on Firefox so using the second one
		// https://stackoverflow.com/questions/44227270/regex-to-parse-image-link-in-markdown		
		// input.match(/!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/)
		// https://stackoverflow.com/questions/20128238/regex-to-match-markdown-image-pattern-with-the-given-filename	
		input.match(/!\[(.*?)\]\((.*?)\)/)

	static def titleMatch input
		input.match(/#.*\n/)
	
	static def isToggleList input
		input.match(/^-/)
	
	static def cleanToggleName input
		input.replace(/^-\s?/, '')

	static def cleanTitle input
		input.replace(/#\s?/, '')