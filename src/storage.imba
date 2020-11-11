export def iget key
	localStorage.getItem(key)

export def iset key, value
	localStorage.setItem(key, value)

# Remember the viewers last view		
export def viewparam
	let params = new URLSearchParams(document.location.search.substring(1));
	params.get("view")	