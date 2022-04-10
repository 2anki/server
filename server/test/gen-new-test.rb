template = <<-EOS
test.skip("{{test}}", async (t) => {
  t.fail("to be implemented");
});
EOS

options = [
	"Toggle Mode",
	"Add Notion Link",
	"Use Notion ID",
	"Use All Toggle Lists",
	"Template Options",
	"Use Plain Text for Back",
	"Enable Cherry Picking Using 🍒 Emoji",
	"Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji",
	"Treat Strikethrough as Tags",
	"Basic and Reversed",
	"Just the Reversed Flashcards",
	"Remove Underlines",
	"Maximum One Toggle Per Card",
	"Remove the MP3 Links Created From Audio Files",
	"Preserve Newlines in the Toggle Header and Body",
	"Template Options"
]

for option in options
	puts template.gsub("{{test}}", option)
end