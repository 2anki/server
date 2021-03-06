const cheerio = require('cheerio')

class ToggleList {
  constructor (input, mode) {
    const dom = cheerio.load(input)
    this.mode = mode
    this.configure(dom)
  }

  configure (dom) {
    // TODO: respect toggle mode
    const t = dom(dom('ul').toArray()[0])
    this.parentClass = t.attr('class') || ''
    this.front = this.findFront(t, dom)
    this.back = this.findBack(t, dom)
  }

  findFront (t, dom) {
    this.summary = t.find('summary').first()
    this.ensureValid(this.summary)
    this.parentClass ? dom('summary').addClass(this.parentClass) : console.log('no class for front')
    return this.parentClass ? `<div class='${this.parentClass}'>${this.summary.html()}</div>` : this.summary.html()
  }

  findBack (t, dom) {
    this.parentClass ? dom('details').addClass(this.parentClass) : console.log('no class for back')
    if (this.mode === 'open_toggle') {
      dom('details').attr('open', '')
    } else if (this.mode === 'close_toggle') {
      dom('details').removeAttr('open')
    }
    const details = t.find('details').first()
    return this.justTheDetails(details, this.summary)
  }

  ensureValid (summary) {
    if (!summary || !summary.text()) {
      throw new Error('Invalid toggle list. Missing summary!')
    }
  }

  /**
         * The way the details tags work, the summary is inside the details
         *      <details>
         *              <summary>[...]</summary>
         *              [...]
         *      </details>
         * @param { The <details></details> tag object} details
         * @param {The <summary></summary> tag object} summary
         */
  justTheDetails (details, summary) {
    //  Also remove any empty leftover summary tags
    return details.html()
      .replace(summary.html(), '')
      .replace(/<p[^/>][^>]*><\/p>/g, '')
      .replace(/<summary[^/>][^>]*><\/summary>/g, '')
  }

  use (tags) {
    this.tags = tags.tags
    this.front = tags.front
    this.back = tags.back
  }
}

module.exports.ToggleList = ToggleList
