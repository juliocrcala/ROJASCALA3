import React, { useState, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertList = (ordered: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const lines = selectedText.split('\n').filter(line => line.trim());
    const prefix = ordered ? '1. ' : '- ';

    let formattedList = '';
    if (lines.length > 0) {
      formattedList = lines.map((line, index) => {
        const itemPrefix = ordered ? `${index + 1}. ` : '- ';
        return itemPrefix + line.trim();
      }).join('\n');
    } else {
      formattedList = prefix;
    }

    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    const needsNewlineBefore = beforeText.length > 0 && !beforeText.endsWith('\n');
    const needsNewlineAfter = afterText.length > 0 && !afterText.startsWith('\n');

    const newText = beforeText +
      (needsNewlineBefore ? '\n' : '') +
      formattedList +
      (needsNewlineAfter ? '\n' : '') +
      afterText;

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const renderPreview = (text: string) => {
    let html = text;

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    html = html.replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6">$1</li>');
    html = html.replace(/(<li class="ml-6">.*<\/li>)/s, '<ol class="list-decimal list-inside mb-4">$1</ol>');

    html = html.replace(/^[-*]\s+(.*$)/gim, '<li class="ml-6">$1</li>');
    html = html.replace(/(<li class="ml-6">(?:(?!<ol).)*<\/li>)/s, '<ul class="list-disc list-inside mb-4">$1</ul>');

    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = '<p class="mb-4">' + html + '</p>';

    return html;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b px-3 py-2 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Negrita (Ctrl+B)"
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Cursiva (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() => insertMarkdown('## ', '')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Subtítulo"
        >
          <Heading2 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={() => insertList(false)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Lista con viñetas"
        >
          <List size={18} />
        </button>

        <button
          type="button"
          onClick={() => insertList(true)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Lista numerada"
        >
          <ListOrdered size={18} />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          {showPreview ? 'Editar' : 'Vista previa'}
        </button>
      </div>

      {showPreview ? (
        <div
          className="p-4 min-h-[300px] prose max-w-none"
          dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full p-4 resize-none focus:outline-none font-mono text-sm"
        />
      )}

      <div className="bg-gray-50 border-t px-3 py-2 text-xs text-gray-600">
        <span className="font-semibold">Formato:</span> **negrita** *cursiva* ## Subtítulo - lista • viñeta
      </div>
    </div>
  );
}
