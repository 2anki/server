import path from 'path'

# This is due to legacy stuff and links shared around the web
export def ConfigureOldEndpoints app, distDir
	const old = ['/notion', '/index',  '/upload']
	for p in old
		console.log('setting up request handler for ', p)
		app.get (p) do |req, res| res.sendFile(path.join(distDir, 'index.html'))
		app.get ("{p}.html") do |req, res| res.sendFile(path.join(distDir, 'index.html'))