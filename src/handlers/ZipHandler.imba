const JSZip = require("jszip")

export default class ZipHandler

	def filenames()
		self.file_names

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