export def upload_path hostname
	if hostname.includes('localhost')
		return "http://localhost:2020/f/upload"
	elif hostname.includes('dev')
		return "/f-dev/upload"
	else
		return "/f/upload"
