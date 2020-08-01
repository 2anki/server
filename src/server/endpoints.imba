export def upload_path hostname
	switch hostname
		when 'localhost'
			return "http://localhost:2020/f/upload"
		when hostname.includes('dev')
			return "/f-dev/upload"
		else
			"/f/upload"