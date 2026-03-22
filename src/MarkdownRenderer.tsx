import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    let html = text;

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-10 mb-5">$1</h1>');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    const lines = html.split('\n');
    let inOrderedList = false;
    let inUnorderedList = false;
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isOrderedItem = /^\d+\.\s+(.*)$/.test(line);
      const isUnorderedItem = /^[-*]\s+(.*)$/.test(line);

      if (isOrderedItem) {
        if (!inOrderedList) {
          processedLines.push('<ol class="list-decimal list-inside mb-6 ml-4 space-y-2">');
          inOrderedList = true;
        }
        const content = line.replace(/^\d+\.\s+(.*)$/, '$1');
        processedLines.push(`<li class="text-gray-700">${content}</li>`);
      } else if (isUnorderedItem) {
        if (!inUnorderedList) {
          processedLines.push('<ul class="list-disc list-inside mb-6 ml-4 space-y-2">');
          inUnorderedList = true;
        }
        const content = line.replace(/^[-*]\s+(.*)$/, '$1');
        processedLines.push(`<li class="text-gray-700">${content}</li>`);
      } else {
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        processedLines.push(line);
      }
    }

    if (inOrderedList) processedLines.push('</ol>');
    if (inUnorderedList) processedLines.push('</ul>');

    html = processedLines.join('\n');

    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed text-justify">');
    html = '<p class="mb-4 text-gray-700 leading-relaxed text-justify">' + html + '</p>';

    return html;
  };

  return (
    <div
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
