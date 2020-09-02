import {execFile} from 'child_process'
import path from 'path'

import { customAlphabet } from 'nanoid'

const PYTHON_INTERPRETER = '/usr/bin/python3'

export default class CardGenerator

	constructor workspace
		self.ccs = path.join(__dirname, '../../genanki/create_deck.py')
		self.cwd = workspace
	
	def generate_id
		const nid = customAlphabet('1234567890', 16)
		nid()

	def run
		const dpayload = path.join(self.cwd, 'deck_info.json')
		const dsc = path.join(self.cwd, 'deck_style.css')
		const did = self.generate_id!

		let ccs_args = [ self.ccs, dpayload, did, dsc]
		Promise.new do |resolve, reject|
			execFile(PYTHON_INTERPRETER, ccs_args, {cwd: self.cwd}) do |err, stdout, stderr|
				if err
					console.log('stderr::', stderr)
					console.error(err)
					reject(err)
				else
					console.log('status from create_deck', stdout)
					resolve(stdout)