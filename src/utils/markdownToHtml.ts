// Markdown to HTML converter utility for blog content
// Converts blog content from markdown format to HTML for Quill editor

export interface ConversionOptions {
  preserveLineBreaks?: boolean;
  cleanHtml?: boolean;
}

/**
 * Converts markdown text to HTML format suitable for Quill editor
 * Handles headers, paragraphs, lists, images, links, and basic inline formatting
 */
export function markdownToHtml(markdown: string, options: ConversionOptions = {}): string {
  const { preserveLineBreaks = false, cleanHtml = true } = options;
  
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let html = markdown;

  // Clean up extra whitespace at start/end
  html = html.trim();

  // Convert headers (must be done before paragraphs)
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Convert images ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert bold and italic (do these before other processing)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

  // Handle lists
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check for ordered list items
    if (/^\d+\.\s/.test(trimmedLine)) {
      if (!inOrderedList) {
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        processedLines.push('<ol>');
        inOrderedList = true;
      }
      const listItemText = trimmedLine.replace(/^\d+\.\s/, '');
      processedLines.push(`<li>${listItemText}</li>`);
    }
    // Check for unordered list items
    else if (/^[-*+]\s/.test(trimmedLine)) {
      if (!inUnorderedList) {
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        processedLines.push('<ul>');
        inUnorderedList = true;
      }
      const listItemText = trimmedLine.replace(/^[-*+]\s/, '');
      processedLines.push(`<li>${listItemText}</li>`);
    }
    // Regular line
    else {
      // Close any open lists
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }

      // Handle empty lines and paragraphs
      if (trimmedLine === '') {
        processedLines.push('');
      } else if (!trimmedLine.startsWith('<')) {
        // Only wrap in <p> if it's not already an HTML tag
        processedLines.push(`<p>${line}</p>`);
      } else {
        processedLines.push(line);
      }
    }
  }

  // Close any remaining open lists
  if (inOrderedList) {
    processedLines.push('</ol>');
  }
  if (inUnorderedList) {
    processedLines.push('</ul>');
  }

  html = processedLines.join('\n');

  // Convert double line breaks to paragraph breaks (only if preserveLineBreaks is false)
  if (!preserveLineBreaks) {
    html = html.replace(/\n\n+/g, '\n');
  }

  // Clean up extra whitespace
  if (cleanHtml) {
    html = html
      .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
      .replace(/>\s+</g, '><')   // Remove whitespace between tags
      .trim();
  }

  return html;
}

/**
 * Converts HTML back to markdown (simplified version for basic cases)
 * Mainly used for displaying in plain text contexts
 */
export function htmlToMarkdown(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let markdown = html;

  // Convert headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Convert images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');

  // Convert inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');

  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
  });

  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
  });

  // Clean up extra whitespace and line breaks
  markdown = markdown
    .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();

  return markdown;
}

/**
 * Checks if content is likely markdown or HTML
 */
export function isMarkdown(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Check for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /^\*\s/m,               // Unordered lists
    /^\d+\.\s/m,            // Ordered lists
    /\*\*.*?\*\*/,          // Bold
    /\*.*?\*/,              // Italic
    /!\[.*?\]\(.*?\)/,      // Images
    /\[.*?\]\(.*?\)/,       // Links
    /^>\s/m,                // Blockquotes
    /`.*?`/,                // Inline code
  ];

  // Check for HTML patterns
  const htmlPatterns = [
    /<[^>]+>/,              // HTML tags
    /&[a-zA-Z]+;/,          // HTML entities
  ];

  const markdownScore = markdownPatterns.reduce((score, pattern) => {
    return score + (pattern.test(content) ? 1 : 0);
  }, 0);

  const htmlScore = htmlPatterns.reduce((score, pattern) => {
    return score + (pattern.test(content) ? 1 : 0);
  }, 0);

  // If we have more markdown patterns than HTML patterns, it's likely markdown
  return markdownScore > htmlScore;
}

/**
 * Smart converter that detects content type and converts as needed
 */
export function smartConvert(content: string, targetFormat: 'html' | 'markdown' = 'html'): string {
  if (!content) return '';

  const contentIsMarkdown = isMarkdown(content);
  
  if (targetFormat === 'html') {
    return contentIsMarkdown ? markdownToHtml(content) : content;
  } else {
    return contentIsMarkdown ? content : htmlToMarkdown(content);
  }
}