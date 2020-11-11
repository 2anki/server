export def iget key
	localStorage.getItem(key, null)

export def iset key, value
	return if not key
	localStorage.setItem(key, value)

# Remember the viewers last view		
export def viewparam
	let params = new URLSearchParams(document.location.search.substring(1));
	params.get("view")	