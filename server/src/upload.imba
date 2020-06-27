def error_handler code, message, cb
	cb(null, {statusCode: code, body: message} )

# TODO: Use security policy that only allows notion2anki.alemayhu.com to use the upload handler
export def handler event, context, callback
	const method = event.httpMethod
	
	return error_handler(400, 'Expected a valid POST method', callback) if method != 'POST'

	console.log('event', event)
	console.log 'context', context
	console.log('callback', callback)
	callback(null, {statusCode: 200,body: "Hello, World"} )