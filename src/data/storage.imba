export def iget key
	const v = localStorage.getItem(key)
	return JSON.parse(v) if v and v.match(/false|true/)
	v

export def iset key, value
	return if not key
	localStorage.setItem(key, value)

# Remember the viewers last view		
export def viewparam
	let params = new URLSearchParams(document.location.search.substring(1))
	let view = 	params.get("view")	
	if not view
		return 'upload'
	view