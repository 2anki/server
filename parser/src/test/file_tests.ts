import path from 'path'
import fs from 'fs'

import test from 'ava'

import n2aParser from '../index'

test('Reading Page Name', t => {
        const htmlFile = path.join(__dirname, 'fixtures', 'example.html')
        const payload = fs.readFileSync(htmlFile).toString()
        const parser = new n2aParser(payload)
        t.true(parser.pageTitle() == 'Capitals in Europe')
})