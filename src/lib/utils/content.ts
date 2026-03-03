// Content loader for markdown-based quiz and video content
// Content files are stored in static/content/ as markdown files
// This makes it easy for non-coders to edit content!

import type { StoryPage, QuizQuestion, Video, VideoCategoryType } from '$lib/types';

// ============================================
// FRONTMATTER PARSER
// ============================================

interface FrontmatterResult {
  data: Record<string, string | number | boolean>;
  body: string;
}

function parseFrontmatter(content: string): FrontmatterResult {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, body: content };
  }

  const frontmatter = match[1];
  const body = match[2];

  // Simple YAML parser for basic key-value pairs
  const data: Record<string, string | number | boolean> = {};
  const lines = frontmatter.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: string | boolean | number = line.slice(colonIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse booleans and numbers
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);

      data[key] = value;
    }
  }

  return { data, body };
}

// ============================================
// QUIZ MARKDOWN PARSER
// ============================================

interface ParsedQuiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

/**
 * Parse quiz markdown format with rationales:
 *
 * ## Question 1
 *
 * What is the question?
 *
 * - [ ] Wrong answer
 *   > Rationale for wrong answer
 *
 * - [x] Correct answer
 *   > Rationale for correct answer
 *
 * - [ ] Another wrong answer
 *   > Rationale for another wrong answer
 *
 * - [ ] Fourth option
 *   > Rationale for fourth option
 *
 * > Hint: Optional hint text
 *
 * ---
 */
function parseQuizMarkdown(content: string): ParsedQuiz {
  const { data, body } = parseFrontmatter(content);

  const id = Number(data.id) || 0;
  const title = String(data.title || `Quiz ${id}`);
  const questions: QuizQuestion[] = [];

  // Split by question headers (## Question N)
  const questionBlocks = body.split(/(?=^## Question \d+)/m).filter(block => block.trim());

  questionBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');

    // Skip the header line (## Question N)
    const headerMatch = lines[0]?.match(/^## Question \d+/);
    if (!headerMatch) return;

    // Find the question text (first non-empty line after header)
    let questionText = '';
    let lineIndex = 1;

    // Skip empty lines and find question text
    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      if (line && !line.startsWith('-') && !line.startsWith('>')) {
        questionText = line;
        lineIndex++;
        break;
      }
      lineIndex++;
    }

    if (!questionText) return;

    // Parse options with rationales
    const options: { id: string; text: string; rationale?: string }[] = [];
    let correctOptionId = '';
    let hint: string | undefined;
    let currentOption: { id: string; text: string; rationale?: string } | null = null;

    const optionLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
    let optionIndex = 0;

    for (let i = lineIndex; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip separators and empty lines
      if (trimmedLine === '---' || trimmedLine === '') continue;

      // Check for option (- [ ] or - [x])
      const optionMatch = trimmedLine.match(/^- \[([ x])\] (.+)$/);
      if (optionMatch) {
        // Save previous option if exists
        if (currentOption) {
          options.push(currentOption);
        }

        const isCorrect = optionMatch[1] === 'x';
        const text = optionMatch[2].trim();
        const optId = optionLetters[optionIndex] || `opt${optionIndex}`;

        currentOption = { id: optId, text };

        if (isCorrect) {
          correctOptionId = optId;
        }

        optionIndex++;
        continue;
      }

      // Check for indented rationale (2+ spaces before >) - belongs to current option
      const indentedRationaleMatch = line.match(/^  +>\s*(.+)$/);
      if (indentedRationaleMatch && currentOption) {
        const rationaleText = indentedRationaleMatch[1].trim();
        if (currentOption.rationale) {
          currentOption.rationale += ' ' + rationaleText;
        } else {
          currentOption.rationale = rationaleText;
        }
        continue;
      }

      // Check for hint (non-indented > Hint: at the end)
      const hintMatch = trimmedLine.match(/^>\s*Hint:\s*(.+)$/i);
      if (hintMatch) {
        // Save current option before processing hint
        if (currentOption) {
          options.push(currentOption);
          currentOption = null;
        }
        hint = hintMatch[1].trim();
        continue;
      }

      // Check for non-indented blockquote that's NOT a hint (could be rationale without indent)
      // This handles the case where rationale starts with just > without indent
      const nonIndentedBlockquote = trimmedLine.match(/^>\s*(.+)$/);
      if (nonIndentedBlockquote && currentOption && !trimmedLine.toLowerCase().includes('hint:')) {
        const rationaleText = nonIndentedBlockquote[1].trim();
        if (currentOption.rationale) {
          currentOption.rationale += ' ' + rationaleText;
        } else {
          currentOption.rationale = rationaleText;
        }
        continue;
      }
    }

    // Don't forget the last option
    if (currentOption) {
      options.push(currentOption);
    }

    if (options.length > 0 && correctOptionId) {
      questions.push({
        id: index + 1,
        pageId: id,
        question: questionText,
        options,
        correctOptionId,
        hint,
      });
    }
  });

  return { id, title, questions };
}

// ============================================
// VIDEO MARKDOWN PARSER
// ============================================

interface ParsedVideoCategory {
  category: VideoCategoryType;
  name: string;
  description: string;
  videos: Video[];
}

/**
 * Parse video markdown format:
 *
 * ## Video Title
 *
 * https://www.youtube.com/watch?v=VIDEO_ID
 *
 * Description of the video
 */
function parseVideoMarkdown(content: string): ParsedVideoCategory {
  const { data, body } = parseFrontmatter(content);

  const category = String(data.category || 'general') as VideoCategoryType;
  const name = String(data.name || category);
  const description = String(data.description || '');

  const videos: Video[] = [];

  // Split by video headers (## Title)
  const videoBlocks = body.split(/(?=^## )/m).filter(block => block.trim());

  videoBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');

    // Get title from header (## Title)
    const titleMatch = lines[0]?.match(/^## (.+)$/);
    if (!titleMatch) return;

    const title = titleMatch[1].trim();
    let youtubeUrl = '';
    let videoDescription = '';

    // Parse remaining lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and separators
      if (!line || line === '---') continue;

      // Check for YouTube URL
      if (line.includes('youtube.com/watch') || line.includes('youtu.be/')) {
        youtubeUrl = line;
        continue;
      }

      // Everything else is description
      if (youtubeUrl && !videoDescription) {
        videoDescription = line;
      }
    }

    if (title && youtubeUrl) {
      videos.push({
        id: `${category}-${index + 1}`,
        title,
        description: videoDescription || undefined,
        youtubeUrl,
        category,
      });
    }
  });

  return { category, name, description, videos };
}

// ============================================
// CONTENT LOADING FUNCTIONS
// ============================================

// Cache for loaded content
let quizCache: Map<number, QuizQuestion[]> = new Map();
let quizIndexCache: { id: number; folder: string }[] | null = null;
let videoCache: ParsedVideoCategory[] | null = null;
let pagesCache: StoryPage[] | null = null;

// List of video categories (matches folder names in static/content/videos/)
const VIDEO_CATEGORIES = ['carbon-cycle', 'human-actions', 'climate-change', 'solutions'];

/**
 * Load quiz index to map IDs to folder names
 */
async function loadQuizIndex(): Promise<{ id: number; folder: string }[]> {
  if (quizIndexCache) return quizIndexCache;

  try {
    const response = await fetch('/content/quizzes/index.json');
    if (!response.ok) {
      throw new Error('Quiz index not found');
    }
    const data = await response.json();
    quizIndexCache = data.quizzes;
    return quizIndexCache!;
  } catch (error) {
    console.error('Error loading quiz index:', error);
    return [];
  }
}

/**
 * Load quiz questions from markdown files in /content/quizzes/
 */
export async function getQuizQuestions(pageId: number): Promise<QuizQuestion[]> {
  // Check cache first
  if (quizCache.has(pageId)) {
    return quizCache.get(pageId)!;
  }

  try {
    // Load quiz index to find the folder name for this pageId
    const quizIndex = await loadQuizIndex();
    const quizEntry = quizIndex.find(q => q.id === pageId);

    if (!quizEntry) {
      console.warn(`Quiz index entry not found for page ${pageId}`);
      return [];
    }

    // Load the markdown quiz file
    const response = await fetch(`/content/quizzes/${quizEntry.folder}/quiz.md`);
    if (!response.ok) {
      console.warn(`Quiz file not found for page ${pageId} at /content/quizzes/${quizEntry.folder}/quiz.md`);
      return [];
    }

    const content = await response.text();
    const parsed = parseQuizMarkdown(content);

    // Cache the result
    quizCache.set(pageId, parsed.questions);

    return parsed.questions;
  } catch (error) {
    console.error(`Error loading quiz for page ${pageId}:`, error);
    return [];
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|[?&]v=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Load local video manifest mapping YouTube IDs to local MP4 paths
 */
async function loadLocalVideoMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const response = await fetch('/youtube-videos/manifest.json');
    if (!response.ok) return map;
    const data = await response.json();
    for (const entry of data.videos) {
      map.set(entry.video_id, `/youtube-videos/${entry.file}`);
    }
  } catch {
    // Local videos not available — fall back to YouTube
  }
  return map;
}

/**
 * Load all videos from markdown files
 */
export async function getVideos(): Promise<{ category: string; name: string; description: string; videos: Video[] }[]> {
  // Check cache first
  if (videoCache) {
    return videoCache;
  }

  // Load local video manifest in parallel with category fetches
  const localVideoMap = await loadLocalVideoMap();

  const categories: ParsedVideoCategory[] = [];

  for (const categoryId of VIDEO_CATEGORIES) {
    try {
      const response = await fetch(`/content/videos/${categoryId}.md`);
      if (!response.ok) {
        console.warn(`Video file not found for category ${categoryId}`);
        continue;
      }

      const content = await response.text();
      const parsed = parseVideoMarkdown(content);

      // Attach local video URLs where available
      for (const video of parsed.videos) {
        const ytId = extractYouTubeId(video.youtubeUrl);
        if (ytId && localVideoMap.has(ytId)) {
          video.localVideoUrl = localVideoMap.get(ytId);
        }
      }

      categories.push(parsed);
    } catch (error) {
      console.error(`Error loading videos for category ${categoryId}:`, error);
    }
  }

  // Cache the result
  videoCache = categories;

  return categories;
}

/**
 * Load story pages from manifest (pages still use JSON for complex data like HTML explanations)
 */
export async function getStoryPages(): Promise<StoryPage[]> {
  // Check cache first
  if (pagesCache) {
    return pagesCache;
  }

  try {
    const response = await fetch('/content/manifest.json');
    if (!response.ok) {
      throw new Error('Failed to load content manifest');
    }

    const manifest = await response.json();

    pagesCache = manifest.pages.map((page: any, index: number) => ({
      id: page.id,
      title: page.title,
      description: page.description,
      explanation: page.explanation,
      audioUrl: page.audioUrl,
      modelUrls: page.modelUrls,
      imageUrl: page.imageUrl,
      targetIndex: index,
    }));

    return pagesCache!;
  } catch (error) {
    console.error('Error loading story pages:', error);
    return getDefaultPages();
  }
}

/**
 * Default pages if manifest not found
 */
function getDefaultPages(): StoryPage[] {
  return [
    {
      id: 1,
      title: 'The Carbon Cycle',
      description: 'Learn about how carbon moves through our planet.',
      explanation: '<strong>Carbon</strong> is all around us!',
      targetIndex: 0,
    },
  ];
}

/**
 * Clear content cache (useful for development)
 */
export function clearContentCache() {
  quizCache.clear();
  quizIndexCache = null;
  videoCache = null;
  pagesCache = null;
}

/**
 * Preload all content (call on app start for better performance)
 */
export async function preloadContent() {
  // Preload pages
  await getStoryPages();

  // Preload quiz index
  const index = await loadQuizIndex();

  // Preload all quizzes
  await Promise.all(index.map(q => getQuizQuestions(q.id)));

  // Preload videos
  await getVideos();
}
