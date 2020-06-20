import {spawn} from 'child_process'

# build the html pages
# webpack --mode=production

def build_process
	Promise.new do |resolve, reject|
		const wc = spawn('yarn', ['run', 'webpack', '--mode=production'])
		wc.stdout.on('data') do |data|
			console.log data.toString!
		wc.stderr.on('data') do |data|
			console.log data.toString!
			reject(data)
		wc.on('close') do |code|
			resolve(code)

build_process!