import getSubDeckName from './getSubDeckName';

const MOCK_CHILD_PAGE = JSON.parse(`
{
	"properties": {
		"title": {
			"id": "title",
			"type": "title",
			"title": [
				{
					"type": "text",
					"text": {
						"content": "Basic Only",
						"link": null
					},
					"annotations": {
						"bold": false,
						"italic": false,
						"strikethrough": false,
						"underline": false,
						"code": false,
						"color": "default"
					},
					"plain_text": "Basic Only",
					"href": null
				}
			]
		}
	}
}
`);

describe('getSubDeckName', () => {
  it.each([
    ['name from title', { title: 'cool' }, 'cool'],
    ['empty', {}, 'Untitled'],
    ['child page', MOCK_CHILD_PAGE, 'Basic Only'],
  ])('%s', (_, input, expected) => {
    expect(getSubDeckName(input)).toBe(expected);
  });
});
