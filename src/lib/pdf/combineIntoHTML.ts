import path from 'path';

export function combineIntoHTML(imagePaths: string[], title: string): string {
  const html = `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  ${Array.from({ length: imagePaths.length / 2 }, (_, i) => {
    const front = path.basename(imagePaths[i * 2]);
    const back = path.basename(imagePaths[i * 2 + 1]);
    return `<ul class="toggle">
    <li>
      <details>
        <summary>
        <img src="${front}" />
        </summary>
        <img src="${back}" />
      </details>
    </li>
    </ul>`;
  }).join('\n')}
</body>
</html>`;

  return html;
}
