const path = require('path')

module.exports.TEMPLATE_DIR = path.join(__dirname, "./templates");

module.exports.resolvePath = function (dir, x) {
	const p = path.resolve(path.join(dir, x)).replace(/app.asar/g, 'app.asar.unpacked');
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