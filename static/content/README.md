# ClimaTales Content Guide

This folder contains all the educational content for ClimaTales AR. You can edit these files without any coding knowledge!

---

## Quizzes

Quizzes are stored in the `quizzes/` folder. Each quiz has its own subfolder with a `quiz.md` file inside.

### Folder Structure

```
quizzes/
├── index.json              ← Maps quiz folders to page numbers
├── the-carbon-cycle/
│   └── quiz.md
├── factories-and-pollution/
│   └── quiz.md
├── oceans-and-carbon/
│   └── quiz.md
└── ... more quizzes
```

### Quiz File Format

Each `quiz.md` file uses this format:

```markdown
---
id: 1
title: The Carbon Cycle
---

## Question 1

What is the question text?

- [ ] Wrong answer
- [x] Correct answer (marked with x)
- [ ] Another wrong answer

> Hint: Optional hint text here!

---

## Question 2

Next question goes here...

- [ ] Option A
- [x] Option B (correct)
- [ ] Option C
- [ ] Option D
```

### Key Rules for Quizzes

1. **Header**: Start with `---` lines containing `id` and `title`
2. **Questions**: Each question starts with `## Question N`
3. **Options**: Use `- [ ]` for wrong answers, `- [x]` for the correct answer
4. **Hints**: Optional - start with `>` on a new line
5. **Separators**: Use `---` between questions (optional but cleaner)

### Adding a New Quiz

1. Create a new folder in `quizzes/` (use lowercase with dashes, e.g., `my-new-quiz`)
2. Create a `quiz.md` file inside with your questions
3. Add an entry to `index.json`:

```json
{
  "quizzes": [
    { "id": 1, "folder": "the-carbon-cycle" },
    { "id": 2, "folder": "factories-and-pollution" },
    { "id": 11, "folder": "my-new-quiz" }  ← Add your new quiz here
  ]
}
```

---

## Videos

Videos are stored in the `videos/` folder as markdown files, one file per category.

### Folder Structure

```
videos/
├── carbon-cycle.md
├── human-actions.md
└── climate-change.md
```

### Video File Format

Each video category file uses this format:

```markdown
---
category: carbon-cycle
name: Carbon Cycle
description: Learn about how carbon moves through Earth's systems
---

## Video Title Here

https://www.youtube.com/watch?v=VIDEO_ID

Description of what this video covers

---

## Another Video Title

https://www.youtube.com/watch?v=ANOTHER_ID

Another video description
```

### Key Rules for Videos

1. **Header**: Must include `category`, `name`, and `description`
2. **Videos**: Each video starts with `## Title`
3. **URL**: Put the full YouTube URL on its own line
4. **Description**: Add a brief description after the URL
5. **Separators**: Use `---` between videos

### Adding a New Video Category

1. Create a new `.md` file in `videos/` (e.g., `solutions.md`)
2. Add the frontmatter with category info
3. Add your videos following the format above
4. Update the code in `src/lib/utils/content.ts` to include the new category name in the `VIDEO_CATEGORIES` array

---

## Tips for Editors

- **Use a text editor**: Notepad works, but VS Code or Notepad++ are better
- **Preview your markdown**: Use a markdown previewer to check formatting
- **Keep backups**: Save a copy before making big changes
- **Test locally**: Run the app locally to verify your changes work

## Common Mistakes to Avoid

| Mistake | Correct |
|---------|---------|
| `[X]` (uppercase X) | `[x]` (lowercase x) |
| `-[] Wrong` (no space) | `- [ ] Wrong` (space inside brackets) |
| `##Question` (no space) | `## Question` (space after ##) |
| Missing `---` at file start | Always start with frontmatter |

---

## Need Help?

If you're unsure about something:
1. Look at existing files as examples
2. Make small changes and test
3. Ask a developer if you get stuck

Happy editing!
