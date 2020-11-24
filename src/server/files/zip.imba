import JSZip from 'jszip'

export class ZipHandler

	def build zip_data
		const loadedZip = await JSZip.loadAsync(zip_data)
		self.file_names = Object.keys(loadedZip.files)
		self.file_names = self.file_names.filter do |f| !f.endsWith('/')
		self.files = {}

		for file_name in self.file_names
			const contents = loadedZip.files[file_name]._data.compressedContent
			if file_name.match(/.(md|html)$/)
				self.files["{file_name}"] = await loadedZip.files[file_name].async('text')
			else
				self.files["{file_name}"] = await loadedZip.files[file_name].async('uint8array')	

	def filenames()
		self.file_names

	
	static def toZip decks, advertisment = null
		const zip = new JSZip()
		for d in decks
			zip.file("{d.name}.apkg", d.apkg)
		if advertisment
			zip.file("README.html", advertisment)
		zip.generateAsync({type: "nodebuffer"})
