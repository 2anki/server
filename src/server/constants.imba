import path from 'path'

console.log('__dirname', __dirname)

export const TEMPLATE_DIR = path.join(__dirname, "templates")

export const NoCardsError = new Error('Could not create any cards. Did you write any togglelists?')

