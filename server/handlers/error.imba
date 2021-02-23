import path from 'path'
import fs from 'fs'

import {TEMPLATE_DIR} from '../config/constants'

const errorPage = fs.readFileSync(path.join(TEMPLATE_DIR, 'error-message.html')).toString!

export def ErrorHandler res, err
	res.set('Content-Type', 'text/html');
	let info = errorPage.replace('{err.message}', err.message).replace('{err?.stack}', err.stack)
	res.status(400).send(new Buffer(info))