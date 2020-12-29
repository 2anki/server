import path from 'path'

export const TEMPLATE_DIR = path.join(__dirname, '..', "templates")

export const TriggerNoCardsError = do
	throw new Error('Could not create any cards. Did you write any togglelists?')
	
export const TriggerUnsupportedFormat = do
	throw new Error('Markdown support has been removed, please use HTML.')

export const ALLOWED_ORIGINS = [
		'http://localhost:8080'
		'http://localhost:2020'
		'https://dev.notion2anki.alemayhu.com'
		'https://dev.2anki.net'
		'https://notion.2anki.com'
		'https://2anki.net',
		'https://2anki.com',
		'https://notion.2anki.net',
		'https://dev.notion.2anki.net',
		'https://notion.2anki.net/'
]