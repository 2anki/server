export def iget key
	JSON.parse(localStorage.getItem(key, false))

export def iset key, value
	return if not key
	localStorage.setItem(key, value)

# Remember the viewers last view		
export def viewparam
	let params = new URLSearchParams(document.location.search.substring(1))
	params.get("view")	