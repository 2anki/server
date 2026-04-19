import { applyCloze, hasClozeMarkers } from './renderCloze';

describe('applyCloze', () => {
  it('blanks the active cloze with … on the front', () => {
    const out = applyCloze('{{c1::Paris}} is the capital', 1, 'front');
    expect(out).toBe('<span class="cloze">[…]</span> is the capital');
  });

  it('uses the hint on the front when provided', () => {
    const out = applyCloze('{{c1::Paris::city}} is the capital', 1, 'front');
    expect(out).toBe('<span class="cloze">[city]</span> is the capital');
  });

  it('reveals the active cloze on the back', () => {
    const out = applyCloze('{{c1::Paris}} is the capital', 1, 'back');
    expect(out).toBe('<span class="cloze">Paris</span> is the capital');
  });

  it('reveals non-active clozes as plain answers on both sides', () => {
    const src = '{{c1::Paris}} — {{c2::France}}';
    expect(applyCloze(src, 1, 'front')).toBe(
      '<span class="cloze">[…]</span> — France'
    );
    expect(applyCloze(src, 2, 'back')).toBe(
      'Paris — <span class="cloze">France</span>'
    );
  });

  it('hasClozeMarkers detects cloze syntax', () => {
    expect(hasClozeMarkers('nothing')).toBe(false);
    expect(hasClozeMarkers('{{c1::x}}')).toBe(true);
  });

  it('does not touch content without cloze markers', () => {
    expect(applyCloze('just text', 1, 'front')).toBe('just text');
  });
});
