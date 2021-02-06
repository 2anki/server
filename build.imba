import {spawn} from 'child_process'
import path from 'path'
import fs from 'fs'

def run cmd, options
	console.log('exec1', cmd, options)
	new Promise do |resolve, reject|
		const wc = spawn(cmd, options)
		wc.stdout.on('data') do |data|
			console.log data.toString!
		wc.stderr.on('data') do |data|
			console.log data.toString!
			reject(data)
		wc.on('close') do |code|
			resolve(code)

def build_process
	if !process.env.SKIP_WEBPACK
		await run('./node_modules/.bin/webpack', ['--mode=production'])	
		
build_process!
