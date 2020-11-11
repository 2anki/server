import { test_grouped_cloze } from './test_grouped_cloze'
import { test_colours } from './test_colours_check'
import { test_multi_deck } from './test_multi_deck'
import { test_regression } from './test_regression'
import { test_fixture } from './test_fixture'
# import test
# run test
# check test exit / return code
# fail if not zero

def main
	console.log 'Running test suite'
	test_grouped_cloze!
	test_regression!
	test_multi_deck!
	test_colours!
	test_fixture!

process.on('uncaughtException') do |err, origin|
	console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

if process.main != module
	console.time('execution time')
	main()
	console.timeEnd('execution time')
	process.exit(0)