import path from 'path'

console.log('__dirname', __dirname)

export const TEMPLATE_DIR = path.join(__dirname, "templates")

export const TriggerNoCardsError = do
	throw new Error('Could not create any cards. Did you write any togglelists?')
	
export const TriggerUnsupportedFormat = do
	throw new Error('Markdown support has been removed, please use HTML.')