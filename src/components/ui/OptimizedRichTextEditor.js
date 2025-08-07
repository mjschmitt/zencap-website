import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

// Memoized toolbar component to prevent unnecessary re-renders
const Toolbar = React.memo(({ 
  onBold, 
  onItalic, 
  onUnderline, 
  onUndo, 
  onRedo, 
  onToggleHtml, 
  isHtmlMode, 
  canUndo, 
  canRedo,
  wordCount,
  readingTime 
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-navy-600 p-3 flex items-center justify-between bg-gray-50 dark:bg-navy-700 rounded-t-lg">
      <div className="flex items-center space-x-2">
        {!isHtmlMode && (
          <>
            <button
              type="button"
              onClick={onBold}
              className="p-2 hover:bg-gray-200 dark:hover:bg-navy-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={onItalic}
              className="p-2 hover:bg-gray-200 dark:hover:bg-navy-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={onUnderline}
              className="p-2 hover:bg-gray-200 dark:hover:bg-navy-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-navy-500 mx-2"></div>
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 hover:bg-gray-200 dark:hover:bg-navy-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 hover:bg-gray-200 dark:hover:bg-navy-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
          </>
        )}
        <div className="w-px h-6 bg-gray-300 dark:bg-navy-500 mx-2"></div>
        <button
          type="button"
          onClick={onToggleHtml}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isHtmlMode 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-navy-600 text-gray-700 dark:text-gray-300'
          }`}
          title="Toggle HTML Mode"
        >
          HTML
        </button>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 space-x-4">
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
      </div>
    </div>
  );
});

Toolbar.displayName = 'RichTextEditorToolbar';

// Memoized editor content component
const EditorContent = React.memo(({ 
  isHtmlMode, 
  content, 
  htmlContent, 
  onContentChange, 
  onHtmlChange, 
  editorRef, 
  textareaRef 
}) => {
  if (isHtmlMode) {
    return (
      <textarea
        ref={textareaRef}
        value={htmlContent}
        onChange={onHtmlChange}
        className="w-full h-80 p-4 border-0 resize-none focus:outline-none font-mono text-sm bg-white dark:bg-navy-800 text-gray-900 dark:text-white rounded-b-lg"
        placeholder="Enter HTML content..."
        spellCheck={false}
      />
    );
  }

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={onContentChange}
      onPaste={onContentChange}
      onKeyDown={onContentChange}
      className="min-h-80 p-4 border-0 focus:outline-none bg-white dark:bg-navy-800 text-gray-900 dark:text-white rounded-b-lg prose prose-sm max-w-none dark:prose-invert"
      style={{ minHeight: '320px' }}
      suppressContentEditableWarning={true}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

EditorContent.displayName = 'EditorContent';

// Main optimized rich text editor component
const OptimizedRichTextEditor = React.memo(({ initialContent = '', onChange, className = '' }) => {
  // State management with proper memoization
  const [content, setContent] = useState(initialContent);
  const [isClient, setIsClient] = useState(false);
  const [history, setHistory] = useState([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialContent);

  // Refs for performance optimization
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const historyTimeoutRef = useRef(null);
  const wordCountTimeoutRef = useRef(null);
  const isTogglingModeRef = useRef(false);

  // Debounced onChange to reduce unnecessary calls
  const debouncedOnChange = useMemo(
    () => debounce((value) => {
      if (onChange && typeof onChange === 'function') {
        onChange(value);
      }
    }, 300),
    [onChange]
  );

  // Memoized word count calculation
  const calculateWordCount = useCallback((text) => {
    if (!text || typeof text !== 'string') return 0;
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    return plainText ? plainText.split(/\s+/).length : 0;
  }, []);

  // Memoized reading time calculation
  const calculateReadingTime = useCallback((wordCount) => {
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }, []);

  // Optimized content change handler
  const handleContentChange = useCallback((e) => {
    if (isUpdatingRef.current || isTogglingModeRef.current) return;

    const newContent = e.target.innerHTML || '';
    setContent(newContent);
    debouncedOnChange(newContent);

    // Update word count asynchronously
    if (wordCountTimeoutRef.current) {
      clearTimeout(wordCountTimeoutRef.current);
    }
    wordCountTimeoutRef.current = setTimeout(() => {
      const words = calculateWordCount(newContent);
      setWordCount(words);
      setReadingTime(calculateReadingTime(words));
    }, 150);

    // Add to history with debounce
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        if (newHistory.length > 50) { // Limit history size
          newHistory.shift();
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, 1000);
  }, [debouncedOnChange, calculateWordCount, calculateReadingTime, historyIndex]);

  // HTML mode change handler
  const handleHtmlChange = useCallback((e) => {
    const newHtmlContent = e.target.value;
    setHtmlContent(newHtmlContent);
    setContent(newHtmlContent);
    debouncedOnChange(newHtmlContent);
  }, [debouncedOnChange]);

  // Formatting functions
  const formatText = useCallback((command) => {
    if (htmlMode) return;
    document.execCommand(command, false, null);
    const newContent = editorRef.current?.innerHTML || '';
    setContent(newContent);
    debouncedOnChange(newContent);
  }, [htmlMode, debouncedOnChange]);

  const handleBold = useCallback(() => formatText('bold'), [formatText]);
  const handleItalic = useCallback(() => formatText('italic'), [formatText]);
  const handleUnderline = useCallback(() => formatText('underline'), [formatText]);

  // History management
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevContent = history[newIndex];
      setHistoryIndex(newIndex);
      setContent(prevContent);
      if (htmlMode) {
        setHtmlContent(prevContent);
      }
      debouncedOnChange(prevContent);
      
      if (editorRef.current && !htmlMode) {
        isUpdatingRef.current = true;
        editorRef.current.innerHTML = prevContent;
        isUpdatingRef.current = false;
      }
    }
  }, [historyIndex, history, htmlMode, debouncedOnChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextContent = history[newIndex];
      setHistoryIndex(newIndex);
      setContent(nextContent);
      if (htmlMode) {
        setHtmlContent(nextContent);
      }
      debouncedOnChange(nextContent);
      
      if (editorRef.current && !htmlMode) {
        isUpdatingRef.current = true;
        editorRef.current.innerHTML = nextContent;
        isUpdatingRef.current = false;
      }
    }
  }, [historyIndex, history, htmlMode, debouncedOnChange]);

  // HTML mode toggle
  const toggleHtmlMode = useCallback(() => {
    isTogglingModeRef.current = true;
    
    if (htmlMode) {
      // Switching from HTML to visual mode
      const currentHtmlContent = textareaRef.current?.value || htmlContent || '';
      setHtmlMode(false);
      setContent(currentHtmlContent);
      setHtmlContent(currentHtmlContent);
      debouncedOnChange(currentHtmlContent);
      
      setTimeout(() => {
        if (editorRef.current) {
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = currentHtmlContent;
          isUpdatingRef.current = false;
        }
        isTogglingModeRef.current = false;
      }, 50);
    } else {
      // Switching from visual to HTML mode
      const currentContent = editorRef.current?.innerHTML || content || '';
      setContent(currentContent);
      setHtmlContent(currentContent);
      setHtmlMode(true);
      debouncedOnChange(currentContent);
      
      setTimeout(() => {
        isTogglingModeRef.current = false;
      }, 50);
    }
  }, [htmlMode, htmlContent, content, debouncedOnChange]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'i':
          e.preventDefault();
          handleItalic();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
      }
    }
  }, [handleBold, handleItalic, handleUnderline, handleUndo, handleRedo]);

  // Initial setup
  useEffect(() => {
    setIsClient(true);
    const words = calculateWordCount(initialContent);
    setWordCount(words);
    setReadingTime(calculateReadingTime(words));
  }, [initialContent, calculateWordCount, calculateReadingTime]);

  // Keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (editorRef.current?.contains(e.target) || textareaRef.current?.contains(e.target)) {
        handleKeyDown(e);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleKeyDown]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      if (wordCountTimeoutRef.current) {
        clearTimeout(wordCountTimeoutRef.current);
      }
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // Don't render on server
  if (!isClient) {
    return (
      <div className={`border border-gray-200 dark:border-navy-600 rounded-lg ${className}`}>
        <div className="h-96 flex items-center justify-center text-gray-500">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-navy-600 rounded-lg ${className}`}>
      <Toolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleHtml={toggleHtmlMode}
        isHtmlMode={htmlMode}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        wordCount={wordCount}
        readingTime={readingTime}
      />
      <EditorContent
        isHtmlMode={htmlMode}
        content={content}
        htmlContent={htmlContent}
        onContentChange={handleContentChange}
        onHtmlChange={handleHtmlChange}
        editorRef={editorRef}
        textareaRef={textareaRef}
      />
    </div>
  );
});

OptimizedRichTextEditor.displayName = 'OptimizedRichTextEditor';

export default OptimizedRichTextEditor;