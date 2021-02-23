const path = require('path')

module.exports.TEMPLATE_DIR = path.join(__dirname, '..', "templates");

module.exports.TriggerNoCardsError = function () {
	throw new Error('Could not create any cards. Did you write any togglelists?');
}
	
module.exports.TriggerUnsupportedFormat = function() {
	throw new Error('Markdown support has been removed, please use <a class="button" href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7">HTML</a>');
}

module.exports.resolvePath = function (x) {
	const p = path.resolve(path.join(__dirname, x)).replace(/app.asar/g, 'app.asar.unpacked');
	return x.endsWith('/') ? p+"/" : p;
}

module.exports.ALLOWED_ORIGINS = [
		'http://localhost:8080',
		'http://localhost:2020',
		'https://dev.notion2anki.alemayhu.com',
		'https://dev.2anki.net',
		'https://notion.2anki.com',
		'https://2anki.net',
		'https://2anki.com',
		'https://notion.2anki.net',
		'https://dev.notion.2anki.net',
		'https://notion.2anki.net/'
];