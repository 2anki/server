import {execFile} from 'child_process'
import {homedir} from 'os'
import path from 'path'

import {resolvePath} from '../config/constants'

def python_interpreter
	const os = process.platform
	if os == "win32"
		return "{homedir}\\AppData\\Local\\Programs\\Python\\Python38\\python.exe"
	return '/usr/bin/python3'

export default class CardGenerator

	constructor workspace
		self.ccs = resolvePath('../../genanki/create_deck.py')
		if !fs.existsSync(self.css)
			self.css = resolvePath('../../../dist/create_deck')

		self.cwd = workspace

	def run
		const dpayload = path.join(self.cwd, 'deck_info.json')
		const tdir = resolvePath("../templates/")
		const dsc = path.join(self.cwd, 'deck_style.css')

		let ccs_args = [ self.ccs, dpayload, dsc, tdir]
		new Promise do |resolve, reject|
			execFile(python_interpreter!, ccs_args, {cwd: self.cwd}) do |err, stdout, stderr|
				if err
					console.log('stderr::', stderr)
					console.error(err)
					reject(err)
				else
					console.log('status from create_deck', stdout)
					resolve(stdout)