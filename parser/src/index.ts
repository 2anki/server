import {JSDOM} from 'jsdom'

export default class n2aParser {

        dom: JSDOM

        constructor(html) {
                this.dom = new JSDOM(html)
        }

        document() {
                return this.dom.window.document;
        }

        pageTitle() {
                const pt = this.document().querySelector('.page-title')
                return pt.textContent.trim()
        }
}