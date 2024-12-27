import * as XLSX from 'xlsx';

type XLSXRow = [string | undefined, string | undefined, ...unknown[]];

export function convertXLSXToHTML(buffer: Buffer, title: string): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
  }) as XLSXRow[];

  return `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  ${jsonData
    .map((row: XLSXRow) => {
      const front = row[0] || '';
      const back = row[1] || '';
      return `<ul class="toggle">
    <li>
      <details>
        <summary>${front}</summary>
        <p>${back}</p>
      </details>
    </li>
    </ul>`;
    })
    .join('\n')}
</body>
</html>`;
}
