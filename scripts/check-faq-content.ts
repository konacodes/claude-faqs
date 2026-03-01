import { readdir, readFile } from "fs/promises";
import { resolve } from "path";

interface QuestionBlock {
  file: string;
  line: number;
  question: string;
  answer: string;
}

function isQuestionHeading(heading: string): boolean {
  const trimmed = heading.trim();
  return trimmed.endsWith("?") || trimmed.endsWith("？");
}

function cleanAnswer(raw: string): string {
  let cleaned = raw
    .trim()
    .replace(/^\*\*\[temp answer\]\*\*\s*/i, "")
    .replace(/^\[temp answer\]\s*/i, "")
    .trim();

  const lines = cleaned.split("\n");
  let cursor = 0;
  while (cursor < lines.length && lines[cursor].trim().length === 0) {
    cursor++;
  }

  while (cursor < lines.length) {
    const line = lines[cursor].trim();
    if (!line) {
      cursor++;
      continue;
    }

    const isMetadata = /^(?:\*\*)?answered by(?:\*\*)?\s*:\s*(.+)$/i.test(line)
      || /^_?answered by\s*:\s*(.+)_?$/i.test(line)
      || /^answered_by\s*:\s*(.+)$/i.test(line)
      || /^(?:\*\*)?last verified(?:\*\*)?\s*:\s*(.+)$/i.test(line)
      || /^last_verified_at\s*:\s*(.+)$/i.test(line)
      || /^(?:\*\*)?sources?(?:\*\*)?\s*:\s*(.+)$/i.test(line);
    if (!isMetadata) break;
    cursor++;
  }

  cleaned = lines.slice(cursor).join("\n").trim();

  return cleaned;
}

function parseQuestionBlocks(content: string, file: string): QuestionBlock[] {
  const lines = content.split("\n");
  const blocks: QuestionBlock[] = [];

  let currentQuestion = "";
  let currentLine = 0;
  let currentAnswer: string[] = [];

  const flush = () => {
    if (!currentQuestion) return;
    blocks.push({
      file,
      line: currentLine,
      question: currentQuestion,
      answer: cleanAnswer(currentAnswer.join("\n")),
    });
    currentQuestion = "";
    currentLine = 0;
    currentAnswer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const h1 = line.match(/^# (.+)$/);
    if (h1) {
      flush();
      continue;
    }

    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      const heading = h2[1].trim();
      if (heading.toLowerCase().startsWith("still need help")) {
        flush();
        break;
      }
      flush();
      if (isQuestionHeading(heading)) {
        currentQuestion = heading;
        currentLine = i + 1;
      }
      continue;
    }

    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      flush();
      currentQuestion = h3[1].trim();
      currentLine = i + 1;
      continue;
    }

    if (currentQuestion) {
      currentAnswer.push(line);
    }
  }

  flush();
  return blocks;
}

async function main() {
  const scriptDir = import.meta.dir;
  const root = resolve(scriptDir, "..");
  const faqDir = resolve(root, "faq-content");
  const files = (await readdir(faqDir))
    .filter(f => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  const unanswered: QuestionBlock[] = [];
  const all: QuestionBlock[] = [];

  for (const file of files) {
    const fullPath = resolve(faqDir, file);
    const content = await readFile(fullPath, "utf8");
    const blocks = parseQuestionBlocks(content, file);
    all.push(...blocks);
    for (const block of blocks) {
      if (!block.answer || block.answer === "</>") {
        unanswered.push(block);
      }
    }
  }

  const dupMap = new Map<string, QuestionBlock[]>();
  for (const block of all) {
    const key = block.question.toLowerCase();
    const list = dupMap.get(key) || [];
    list.push(block);
    dupMap.set(key, list);
  }
  const duplicates = [...dupMap.values()].filter(list => list.length > 1);

  console.log(`Scanned ${files.length} files`);
  console.log(`Parsed ${all.length} question blocks`);

  if (unanswered.length === 0) {
    console.log("No unanswered questions found.");
  } else {
    console.log(`\nUnanswered questions (${unanswered.length}):`);
    for (const block of unanswered) {
      console.log(`- ${block.file}:${block.line} ${block.question}`);
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicate question titles found.");
  } else {
    console.log(`\nDuplicate question titles (${duplicates.length}):`);
    for (const group of duplicates) {
      const refs = group.map(q => `${q.file}:${q.line}`).join(", ");
      console.log(`- "${group[0].question}" -> ${refs}`);
    }
    console.log("Note: duplicate titles are allowed and reported as warnings.");
  }

  if (unanswered.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("FAQ check failed:", err);
  process.exit(1);
});
