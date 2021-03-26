export default class Note {
        name: string
        back: string
        tags: string[]

        constructor(name: string, back: string) {
                this.name = name
                this.back = back
                this.tags = []

                if (!back) {
                        throw new Error("Missing back side")
                }
        }
}