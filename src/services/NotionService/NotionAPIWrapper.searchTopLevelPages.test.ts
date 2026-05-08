import NotionAPIWrapper from './NotionAPIWrapper';

const PAGE_WITH_TITLE = (id: string, title: string) => ({
  object: 'page',
  id,
  url: `https://www.notion.so/${id}`,
  parent: { type: 'page_id', page_id: 'root' },
  properties: {
    title: { id: 'title', type: 'title', title: [{ plain_text: title }] },
  },
});

const DB_ROW = (id: string) => ({
  object: 'page',
  id,
  url: `https://www.notion.so/${id}`,
  parent: { type: 'data_source_id', data_source_id: 'ds-1' },
  properties: {
    Name: { id: 'name', type: 'title', title: [{ plain_text: 'Card 1' }] },
  },
});

const UNTITLED_TOP_LEVEL_PAGE = (id: string) => ({
  object: 'page',
  id,
  url: `https://www.notion.so/${id}`,
  parent: { type: 'page_id', page_id: 'root' },
  properties: {
    title: { id: 'title', type: 'title', title: [] },
  },
});

const installSearchStub = (
  wrapper: NotionAPIWrapper,
  pages: ReadonlyArray<{ results: unknown[]; next_cursor: string | null }>
) => {
  let call = 0;
  const search = jest.fn(async () => {
    const page = pages[call] ?? { results: [], next_cursor: null };
    call += 1;
    return {
      object: 'list',
      type: 'page_or_database',
      results: page.results,
      has_more: page.next_cursor != null,
      next_cursor: page.next_cursor,
    };
  });
  (wrapper as unknown as { notion: { search: unknown } }).notion = {
    search,
  } as unknown as NotionAPIWrapper['notion' & keyof NotionAPIWrapper];
  return search;
};

describe('NotionAPIWrapper.searchTopLevelPages', () => {
  test('drops DB rows and untitled pages and keeps real titled top-level pages', async () => {
    const wrapper = new NotionAPIWrapper('test-token', '1');
    installSearchStub(wrapper, [
      {
        results: [
          PAGE_WITH_TITLE('aaa', 'stats'),
          DB_ROW('bbb'),
          UNTITLED_TOP_LEVEL_PAGE('ccc'),
          PAGE_WITH_TITLE('ddd', 'Regression testing'),
        ],
        next_cursor: null,
      },
    ]);

    const result = await wrapper.searchTopLevelPages('');

    expect(result.results.map((r) => r.id)).toEqual(['aaa', 'ddd']);
    expect(result.results.map((r) => r.title)).toEqual([
      'stats',
      'Regression testing',
    ]);
  });

  test('paginates until maxResults real pages are collected or maxPages reached', async () => {
    const wrapper = new NotionAPIWrapper('test-token', '1');
    const search = installSearchStub(wrapper, [
      {
        results: [DB_ROW('row-1'), DB_ROW('row-2'), DB_ROW('row-3')],
        next_cursor: 'cur-2',
      },
      {
        results: [PAGE_WITH_TITLE('p-1', 'Page 1'), DB_ROW('row-4')],
        next_cursor: 'cur-3',
      },
      {
        results: [PAGE_WITH_TITLE('p-2', 'Page 2')],
        next_cursor: null,
      },
    ]);

    const result = await wrapper.searchTopLevelPages('', {
      maxResults: 2,
      maxPages: 5,
    });

    expect(result.results.map((r) => r.id)).toEqual(['p-1', 'p-2']);
    expect(search).toHaveBeenCalledTimes(3);
  });

  test('stops at maxPages even if more results are available', async () => {
    const wrapper = new NotionAPIWrapper('test-token', '1');
    const search = installSearchStub(wrapper, [
      { results: [DB_ROW('a')], next_cursor: 'c1' },
      { results: [DB_ROW('b')], next_cursor: 'c2' },
      { results: [DB_ROW('c')], next_cursor: 'c3' },
    ]);

    const result = await wrapper.searchTopLevelPages('', {
      maxResults: 50,
      maxPages: 2,
    });

    expect(result.results).toEqual([]);
    expect(search).toHaveBeenCalledTimes(2);
  });
});
