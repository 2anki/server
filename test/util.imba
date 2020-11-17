import path from 'path'
import fs from 'fs'

export class Util

	static def load_html_file file_name
		const file_path = path.join(__dirname, "fixtures", file_name)
		const html = fs.readFileSync(file_path).toString!
		{"{file_name}": html, file_name: file_name}