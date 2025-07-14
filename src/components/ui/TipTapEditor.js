import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

export default function TipTapEditor({ initialContent = '', onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] p-4 rounded border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors',
      },
    },
    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent || '', false);
    }
    // eslint-disable-next-line
  }, [initialContent]);

  return (
    <div>
      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap gap-2 mb-2">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('bold') ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>B</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('italic') ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>I</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>H1</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>H2</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>H3</button>
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('bulletList') ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>• List</button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('orderedList') ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>1. List</button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('blockquote') ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>Quote</button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('codeBlock') ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'}`}>Code</button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-3 py-1 rounded text-sm font-medium transition-colors bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600">―</button>
          <button type="button" onClick={() => editor.chain().focus().undo().run()} className="px-3 py-1 rounded text-sm font-medium transition-colors bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600">↺</button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className="px-3 py-1 rounded text-sm font-medium transition-colors bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600">↻</button>
        </div>
      )}
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
} 