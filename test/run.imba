# import { test_create_deck } from './test_create_deck_check'
import { test_multiple_images } from './test_multiple_images'
import { test_grouped_cloze } from './test_grouped_cloze'
import { test_colours } from './test_colours_check'
import { test_multi_deck } from './test_multi_deck'
import { test_fixture } from './test_fixture'

# import test
# run test
# check test exit / return code
# fail if not zero

def main
	console.log 'Running test suite'
	await test_multiple_images()
	await test_grouped_cloze()
	await test_multi_deck()
	await test_colours()
	await test_fixture()
	console.log 'Done running'

process.on('uncaughtException') do |err, origin|
	console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

if process.main != module
	console.time('execution time')
	console.log('Running tests')
	main()
	console.timeEnd('execution time')
	process.exit(0)