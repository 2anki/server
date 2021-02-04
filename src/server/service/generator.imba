import {execFile} from 'child_process'
import {homedir} from 'os'
import path from 'path'

import {resolvePath} from '../config/constants'

export default class CardGenerator

	constructor workspace
		self.ccs = resolvePath('../../../dist/create_deck/create_deck')
		self.cwd = workspace

	def run
		const dpayload = path.join(self.cwd, 'deck_info.json')
		const tdir = resolvePath("../templates/")
		const dsc = path.join(self.cwd, 'deck_style.css')

		let ccs_args = [dpayload, dsc, tdir]
		new Promise do |resolve, reject|
			execFile( self.ccs, ccs_args, {cwd: self.cwd}) do |err, stdout, stderr|
				if err
					console.log('stderr::', stderr)
					console.error(err)
					reject(err)
				else
					console.log('status from create_deck', stdout)
					resolve(stdout)