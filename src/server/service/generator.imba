import {execFile} from 'child_process'
import path from 'path'


const PYTHON_INTERPRETER = '/usr/bin/python3'

export default class CardGenerator

	constructor workspace
		self.ccs = path.join(__dirname, '../../genanki/create_deck.py')
		self.cwd = workspace

	def run
		const dpayload = path.join(self.cwd, 'deck_info.json')
		const tdir = path.join(__dirname, "../templates/")
		const dsc = path.join(self.cwd, 'deck_style.css')

		let ccs_args = [ self.ccs, dpayload, dsc, tdir]
		new Promise do |resolve, reject|
			execFile(PYTHON_INTERPRETER, ccs_args, {cwd: self.cwd}) do |err, stdout, stderr|
				if err
					console.log('stderr::', stderr)
					console.error(err)
					reject(err)
				else
					console.log('status from create_deck', stdout)
					resolve(stdout)