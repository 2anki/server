import * as cheerio from 'cheerio';

function isAnswerOption(text: string): boolean {
  return /^\*?[A-Za-z][.)]\s/.test(text.trim());
}

function isCorrectAnswer(text: string): boolean {
  return text.trim().startsWith('*');
}

function stripAsterisk(text: string): string {
  return text.trim().replace(/^\*/, '');
}

function buildToggle(question: string, options: string[], correctAnswers: string[]): string {
  const optionsHTML = options.map((opt) => `<li>${opt}</li>`).join('');
  const answerHTML = correctAnswers.map((a) => `<strong>${a}</strong>`).join('<br />');

  return `<details><summary>${question}<br /><ul>${optionsHTML}</ul></summary>${answerHTML}</details>`;
}

function looksLikeFlashcard(parts: string[]): boolean {
  if (parts.length <= 1) return false;
  const answerLines = parts.slice(1);
  return answerLines.some((line) => isCorrectAnswer(line));
}

function processListItem(html: string): string | null {
  const parts = html.split(/<br\s*\/?>/i).map((p) => p.trim()).filter(Boolean);

  if (!looksLikeFlashcard(parts)) {
    return null;
  }

  const question = parts[0];
  const answerLines = parts.slice(1);

  const hasMarkedAnswers = answerLines.some((line) => isCorrectAnswer(line));

  if (!hasMarkedAnswers) {
    return null;
  }

  const options: string[] = [];
  const correctAnswers: string[] = [];

  for (const line of answerLines) {
    const cleaned = stripAsterisk(line);
    options.push(cleaned);
    if (isCorrectAnswer(line)) {
      correctAnswers.push(cleaned);
    }
  }

  return buildToggle(question, options, correctAnswers);
}

export function preprocessDocxHTML(html: string): string {
  const $ = cheerio.load(html, { xmlMode: false });

  const lists = $('ol, ul');
  if (lists.length === 0) {
    return html;
  }

  lists.each((_, list) => {
    const items = $(list).find('> li');
    const toggles: string[] = [];
    let hasFlashcards = false;

    items.each((__, li) => {
      const itemHTML = $(li).html() ?? '';
      const result = processListItem(itemHTML);
      if (result !== null) {
        toggles.push(result);
        hasFlashcards = true;
      }
    });

    if (hasFlashcards) {
      $(list).replaceWith(toggles.join('\n'));
    }
  });

  return $.html();
}
