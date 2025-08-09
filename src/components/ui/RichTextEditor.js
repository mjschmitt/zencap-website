import { useEffect, useState, useRef, useCallback } from 'react';
// Updated content comparison logic v2.1

export default function RichTextEditor({ initialContent = '', onChange }) {
  const [content, setContent] = useState(initialContent);
  const [isClient, setIsClient] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [history, setHistory] = useState([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [htmlMode, setHtmlMode] = useState(false); // New state for HTML mode
  const [htmlContent, setHtmlContent] = useState(initialContent); // Separate state for HTML textarea
  // Removed lastInputTime state to prevent unnecessary re-renders
  const editorRef = useRef(null);
  const textareaRef = useRef(null); // New ref for HTML textarea
  const isUpdatingRef = useRef(false);
  const historyTimeoutRef = useRef(null);
  const wordCountTimeoutRef = useRef(null);
  const lastInputTime = useRef(0);
  const savedSelectionRef = useRef(null);
  const shouldUpdateDOMRef = useRef(true);
  const previousInitialContentRef = useRef(null);
  const cursorPositionRef = useRef(null);
  const isUserInputRef = useRef(false); // Track if content change is from user input
  const isTogglingModeRef = useRef(false); // Track if we're toggling HTML mode

  // Toggle between HTML and visual mode
  const toggleHtmlMode = () => {
    console.log('Toggling HTML mode, current mode:', htmlMode);
    isTogglingModeRef.current = true; // Set flag to prevent conflicts
    
    if (htmlMode) {
      // Switching from HTML to visual mode
      // Get the current value from the textarea directly
      const currentHtmlContent = textareaRef.current?.value || htmlContent || '';
      console.log('Switching to visual mode with content:', currentHtmlContent.substring(0, 100));
      console.log('Editor ref exists?', !!editorRef.current);
      
      // Set the mode first to prevent any conflicting updates
      setHtmlMode(false);
      
      // Update states
      setContent(currentHtmlContent);
      setHtmlContent(currentHtmlContent);
      
      // Update the DOM after a small delay to ensure mode switch is complete
      setTimeout(() => {
        if (editorRef.current) {
          console.log('Setting editor innerHTML to:', currentHtmlContent.substring(0, 100));
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = currentHtmlContent;
          isUpdatingRef.current = false;
          console.log('Editor innerHTML after setting:', editorRef.current.innerHTML.substring(0, 100));
        }
        
        if (onChange) {
          onChange(currentHtmlContent);
        }
        
        // Clear the toggle flag after everything is done
        setTimeout(() => {
          isTogglingModeRef.current = false;
        }, 100);
      }, 50);
      
    } else {
      // Switching from visual to HTML mode
      const currentContent = editorRef.current?.innerHTML || content || '';
      console.log('Switching to HTML mode with content:', currentContent.substring(0, 100));
      
      setContent(currentContent);
      setHtmlContent(currentContent);
      setHtmlMode(true);
      
      // Clear the toggle flag
      setTimeout(() => {
        isTogglingModeRef.current = false;
      }, 100);
    }
  };

  // Handle HTML textarea input
  const handleHtmlInput = (e) => {
    const newHtmlContent = e.target.value;
    setHtmlContent(newHtmlContent); // Update HTML state
    setContent(newHtmlContent); // Update internal state
    if (onChange) {
      onChange(newHtmlContent);
    }
  };



  // Handle changes to initialContent prop
  useEffect(() => {
    // More robust initial content detection
    const hasInitialContent = initialContent && initialContent.trim() !== '';
    const isContentDifferent = initialContent !== previousInitialContentRef.current;
    const isEditorEmpty = !editorRef.current || editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<br>';
    const isNotUserInput = !isUserInputRef.current;
    
    // Update if we have new content AND (editor is empty OR this is truly external change) AND we're not toggling modes
    const shouldUpdate = isContentDifferent && isNotUserInput && (isEditorEmpty || hasInitialContent) && !isTogglingModeRef.current;
    
    if (shouldUpdate) {
      console.log('Updating editor with initial content:', initialContent?.substring(0, 100));
      previousInitialContentRef.current = initialContent;
      setContent(initialContent || '');
      setHtmlContent(initialContent || ''); // Also update HTML content state
      
      // Reset history for new content
      setHistory([initialContent || '']);
      setHistoryIndex(0);
      
      // Calculate initial word count and reading time
      const text = (initialContent || '').replace(/<[^>]*>/g, ''); // Remove HTML tags
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.ceil(words / 200);
      setWordCount(words);
      setReadingTime(minutes);
      
      // Update editor content
      setTimeout(() => {
        if (editorRef.current) {
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = initialContent || '';
          isUpdatingRef.current = false;
        }
      }, 50);
    } else if (!hasInitialContent && previousInitialContentRef.current !== '') {
      // Handle empty content case
      console.log('Clearing editor content');
      previousInitialContentRef.current = '';
      setContent('');
      setHtmlContent(''); // Also clear HTML content state
      setHistory(['']);
      setHistoryIndex(0);
      setWordCount(0);
      setReadingTime(0);
      
      if (editorRef.current) {
        isUpdatingRef.current = true;
        editorRef.current.innerHTML = '';
        isUpdatingRef.current = false;
      }
    }
  }, [initialContent, htmlMode]);

  useEffect(() => {
    setIsClient(true);
    
    let handleEnter;
    
    // Set initial content when component mounts
    if (editorRef.current) {
      if (initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
      
      // Add Enter key handler directly to the element
      handleEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          // Check if in a list
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let node = range.startContainer;
            if (node.nodeType === 3) node = node.parentNode;
            
            // If in list, let browser handle it
            if (node.closest('li')) return;
            
            // Otherwise, insert a line break
            e.preventDefault();
            document.execCommand('insertParagraph', false);
          }
        }
      };
      
      editorRef.current.addEventListener('keydown', handleEnter);
    }
    
    // Cleanup
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      if (wordCountTimeoutRef.current) {
        clearTimeout(wordCountTimeoutRef.current);
      }
      if (editorRef.current && handleEnter) {
        editorRef.current.removeEventListener('keydown', handleEnter);
      }
    };
  }, []);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && !event.target.closest('.color-picker-container')) {
        setShowColorPicker(false);
        savedSelectionRef.current = null;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Add focus event listener to restore selection when editor regains focus
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleFocus = () => {
      if (savedSelectionRef.current && showColorPicker) {
        // Small delay to ensure focus is fully established
        setTimeout(() => {
          restoreSelection(savedSelectionRef.current);
        }, 10);
      }
    };

    const handleBlur = () => {
      // Save cursor position when editor loses focus
      saveCursorPosition();
    };

    editor.addEventListener('focus', handleFocus);
    editor.addEventListener('blur', handleBlur);
    return () => {
      editor.removeEventListener('focus', handleFocus);
      editor.removeEventListener('blur', handleBlur);
    };
  }, [showColorPicker]);

  // Add keyboard shortcuts for undo/redo


  // Remove this useEffect as it causes cursor reset issues
  // The editor content is managed through direct DOM manipulation and undo/redo
  // Initial content is set in the main useEffect above

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        cursorPositionRef.current = {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset
        };
      }
    }
  };

  const preserveCursorDuringOperation = (operation) => {
    // Save current selection
        const selection = window.getSelection();
        let savedRange = null;
        if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }

    // Perform the operation
    operation();

    // Try to restore selection if it's still valid
    if (savedRange && editorRef.current) {
      try {
        if (editorRef.current.contains(savedRange.commonAncestorContainer)) {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        }
      } catch (error) {
        console.warn('Could not restore cursor position:', error);
        // Fall back to placing cursor at end
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Helper function to notify content changes without triggering React re-renders
  const notifyContentChange = () => {
    if (onChange && editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      
      // Only notify if content actually changed from what parent knows
      if (newContent !== previousInitialContentRef.current) {
        // Set flag to prevent feedback loop
        isUserInputRef.current = true;
        onChange(newContent);
        // Update our tracking of what the parent knows
        previousInitialContentRef.current = newContent;
        // Reset flag after a short delay
        setTimeout(() => {
          isUserInputRef.current = false;
        }, 100);
        
        // Manually trigger history save since we're bypassing handleInput
        setTimeout(() => {
          saveToHistory(newContent, Date.now());
        }, 50);
      }
    }
  };

  const restoreCursorPosition = () => {
    if (cursorPositionRef.current && editorRef.current) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        
        range.setStart(cursorPositionRef.current.startContainer, cursorPositionRef.current.startOffset);
        range.setEnd(cursorPositionRef.current.endContainer, cursorPositionRef.current.endOffset);
        
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Ensure the editor is focused
        editorRef.current.focus();
        return true;
      } catch (error) {
        console.warn('Failed to restore cursor position:', error);
        return false;
      }
    }
    return false;
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      // Get text offsets relative to the editor
      const startOffset = getTextOffset(editorRef.current, range.startContainer, range.startOffset);
      const endOffset = getTextOffset(editorRef.current, range.endContainer, range.endOffset);
      

      
      return {
        text: selectedText,
        startOffset,
        endOffset,
        editorTextLength: editorRef.current.textContent.length
      };
    }
    return null;
  };

  const getTextOffset = (root, node, offset) => {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent.length;
    }
    return textOffset;
  };

  const restoreSelection = (selectionInfo) => {
    if (!selectionInfo || !editorRef.current) return false;
    
    try {
      const selection = window.getSelection();
      selection.removeAllRanges();
      
      // Find the text nodes and positions using the saved offsets
      const startPos = findTextPosition(editorRef.current, selectionInfo.startOffset);
      const endPos = findTextPosition(editorRef.current, selectionInfo.endOffset);
      

      
      if (startPos && endPos) {
        const range = document.createRange();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        selection.addRange(range);
        

        
        // Return true if selection was restored successfully
        return selection.rangeCount > 0 && !selection.isCollapsed;
      } else {

        return false;
      }
    } catch (e) {
      console.warn('Selection restoration failed:', e);
      return false;
    }
  };

  const findTextPosition = (root, targetOffset) => {
    let currentOffset = 0;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      const nodeLength = currentNode.textContent.length;
      if (currentOffset + nodeLength >= targetOffset) {
        return {
          node: currentNode,
          offset: targetOffset - currentOffset
        };
      }
      currentOffset += nodeLength;
    }
    return null;
  };

  const debugHistory = () => {
    console.log('=== History Debug ===');
    console.log('History length:', history.length);
    console.log('History index:', historyIndex);
    console.log('History content previews:');
    history.forEach((content, index) => {
      console.log(`[${index}]: ${content.substring(0, 100)}...`);
      // Show if this entry has bold tags
      const hasBold = content.includes('<b>') || content.includes('<strong>');
      console.log(`[${index}] Has bold: ${hasBold}`);
    });
    console.log('Current content:', content.substring(0, 100));
    console.log('Current DOM content:', editorRef.current?.innerHTML?.substring(0, 100));
    console.log('===================');
  };

  const saveToHistory = useCallback((newContent, inputTime) => {
    console.log('=== saveToHistory called ===');
    console.log('Content preview:', newContent?.substring(0, 100));
    console.log('Current history length:', history.length);
    console.log('Current history index:', historyIndex);
    console.log('Input time:', inputTime);
          console.log('Last input time:', lastInputTime.current);
    
    // Clear any pending timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    
    // Save to history immediately for better undo/redo responsiveness
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const lastContent = newHistory[newHistory.length - 1];
        
      console.log('Last content preview:', lastContent?.substring(0, 100));
      console.log('New content preview:', newContent?.substring(0, 100));
      
      // More robust content comparison
        const normalizeContent = (content) => {
          if (!content) return '';
          return content
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/\u00A0/g, ' ') // Replace non-breaking space
            .trim();
        };
        
      const normalizedNew = normalizeContent(newContent);
      const normalizedLast = normalizeContent(lastContent);
      
      // Also check text content (without HTML tags)
      const getTextContent = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
      };
      
      const textNew = getTextContent(newContent);
      const textLast = getTextContent(lastContent);
      
      console.log('Normalized new:', normalizedNew.substring(0, 100));
      console.log('Normalized last:', normalizedLast.substring(0, 100));
      console.log('Text new:', textNew.substring(0, 100));
      console.log('Text last:', textLast.substring(0, 100));
      console.log('Text new length:', textNew.length);
      console.log('Text last length:', textLast.length);
      
      // Check if content actually changed - compare raw HTML, normalized HTML, and text content
      const rawHtmlChanged = newContent !== lastContent;
      const normalizedChanged = normalizedNew !== normalizedLast;
      const textChanged = textNew !== textLast;
      
      // Also check if this is the first real change after initial load
      const isFirstChange = newHistory.length === 1 && lastContent && newContent !== lastContent;
      
      const contentChanged = rawHtmlChanged || normalizedChanged || textChanged || isFirstChange;
      
      console.log('Content changed?', contentChanged);
      console.log('Raw HTML different?', rawHtmlChanged);
      console.log('Normalized HTML different?', normalizedChanged);
      console.log('Text content different?', textChanged);
      console.log('Is first change?', isFirstChange);
      
      if (contentChanged) {
          newHistory.push(newContent);
        const newIndex = newHistory.length - 1;
        setHistoryIndex(newIndex);
        console.log('History updated, new index:', newIndex, 'content length:', newContent.length);
          return newHistory.slice(-50); // Keep last 50 states
        }
      
        console.log('Content unchanged, not saving to history');
        return prev;
      });
  }, [historyIndex, history.length]); // Removed lastInputTime dependency to prevent excessive re-renders



  const handleInput = useCallback(() => {
    console.log('=== handleInput called ===');
    if (editorRef.current && !isUpdatingRef.current) {
      const newContent = editorRef.current.innerHTML;
      console.log('New content preview:', newContent?.substring(0, 100));
      
      // Track input time
      const currentTime = Date.now();
      // Store in ref to avoid React re-render on every keystroke
      lastInputTime.current = currentTime;
      
      // Don't update content state during typing to prevent cursor reset
      // Content state will be updated only when needed (undo/redo, initial load, etc.)
      
      // Calculate word count and reading time with debouncing to prevent excessive re-renders
      const text = editorRef.current.textContent || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.ceil(words / 200); // 200 words per minute average
      
      // Use a timeout to debounce word count updates and prevent cursor reset
      if (wordCountTimeoutRef.current) {
        clearTimeout(wordCountTimeoutRef.current);
      }
      wordCountTimeoutRef.current = setTimeout(() => {
        setWordCount(words);
        setReadingTime(minutes);
      }, 500); // Update word count every 500ms instead of on every keystroke
      
      // Use helper to prevent feedback loop
      notifyContentChange();
      
      // Save to history with debouncing to prevent too frequent saves
      // This prevents cursor reset issues from excessive history updates
      if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      }
      historyTimeoutRef.current = setTimeout(() => {
        console.log('Calling saveToHistory from handleInput');
        saveToHistory(newContent, currentTime);
      }, 300); // Increased timeout to 300ms for better performance
    } else {
      console.log('handleInput blocked - isUpdating:', isUpdatingRef.current);
    }
  }, [onChange, saveToHistory]);

  // Flag to prevent React re-renders during DOM manipulation
  const skipNextRenderRef = useRef(false);



  const wrapSelectedText = (tag, attributes = {}) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const selectedText = range.extractContents();
    const wrapper = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      wrapper.setAttribute(key, value);
    });
    
    wrapper.appendChild(selectedText);
    range.insertNode(wrapper);
    
    // IMPORTANT: Select the entire wrapper content to maintain text selection
    // This prevents the selection from disappearing after formatting
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    // Ensure editor stays focused
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const toggleFormat = (tag) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const selectedText = range.toString();
    const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
      ? range.commonAncestorContainer.parentNode 
      : range.commonAncestorContainer;

    // Check if already formatted
    const existingTag = parentElement.closest(tag);
    if (existingTag && editorRef.current.contains(existingTag)) {
      // Remove formatting
      const textContent = existingTag.textContent;
      const textNode = document.createTextNode(textContent);
      
      // Create new range before replacing the node
      const newRange = document.createRange();
      existingTag.parentNode.replaceChild(textNode, existingTag);
      
      // Select the text content
      newRange.selectNodeContents(textNode);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Apply formatting
      wrapSelectedText(tag);
    }
    
    // Ensure editor stays focused
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const setTextColor = (color) => {
    setShowColorPicker(false);
    
    // Focus the editor first
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    // Try to restore the saved selection
    if (savedSelectionRef.current) {
      const restored = restoreSelection(savedSelectionRef.current);
      
      if (restored) {
        // Selection was restored successfully, apply color immediately

        applyColorToSelection(color);
        
        // After applying color, ensure editor stays focused and clear saved selection
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }, 0);
      } else {
        // Selection restore failed, try direct application

        applyColorDirectly(color);
      }
    }
    
    // Clear saved selection after color application
    savedSelectionRef.current = null;
  };

  const applyColorToSelection = (colorValue) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    // Find the color object
    const colorObj = colors.find(c => c.value === colorValue);
    if (!colorObj) return;

    // Always treat as text selection - no special header handling
    // This ensures consistent behavior for all text selections

    // Extract the selected content for partial selections
    const selectedContent = range.extractContents();
    
    // Remove any existing color spans from the selected content
    const cleanedContent = removeColorSpans(selectedContent);
    
    let insertedNode;
    
    if (colorObj.value === 'default') {
      // For default color, use inline style to ensure it works
      const defaultSpan = document.createElement('span');
      defaultSpan.style.setProperty('color', '#111827', 'important'); // gray-900
      // Add a class for even more specificity
      defaultSpan.className = 'custom-text-color';
      defaultSpan.appendChild(cleanedContent);
      range.insertNode(defaultSpan);
      insertedNode = defaultSpan;
    } else {
      // Create new color span for non-default colors
      const colorSpan = document.createElement('span');
      
      // Use multiple methods to ensure the color takes effect
      colorSpan.style.setProperty('color', colorObj.value, 'important');
      colorSpan.style.setProperty('border', 'none', 'important');
      colorSpan.style.setProperty('background', 'transparent', 'important');
      
      // Add a data attribute for targeting with CSS
      colorSpan.setAttribute('data-custom-color', 'true');
      colorSpan.className = 'custom-text-color';
      
      colorSpan.appendChild(cleanedContent);
      
      // Insert the colored content
      range.insertNode(colorSpan);
      insertedNode = colorSpan;
    }
    
    // Move cursor to end of inserted content
    try {
      // For all colors (including default), position cursor after the span
      range.setStartAfter(insertedNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      // If cursor positioning fails, just position at the end of the editor
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Don't manually trigger input event - let the natural DOM change trigger it
    // This prevents cursor reset issues
  };

  const removeColorSpans = (node) => {
    const fragment = document.createDocumentFragment();
    
    const processNode = (currentNode) => {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        return currentNode.cloneNode(true);
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        // If it's a span with color styling (either inline style or CSS class), extract its contents
        if (currentNode.tagName === 'SPAN' && (
          currentNode.style.color ||
          (currentNode.className && (
            currentNode.className.includes('text-') ||
            currentNode.className.includes('dark:text-')
          ))
        )) {
          // This is a color-only span, return its processed children directly
          const childNodes = Array.from(currentNode.childNodes);
          const processedChildren = [];
          childNodes.forEach(child => {
            const processed = processNode(child);
            if (Array.isArray(processed)) {
              processedChildren.push(...processed);
            } else {
              processedChildren.push(processed);
            }
          });
          return processedChildren;
        } else {
          // For other elements, recreate them but process their children
          const newElement = currentNode.cloneNode(false);
          const childNodes = Array.from(currentNode.childNodes);
          childNodes.forEach(child => {
            const processed = processNode(child);
            if (Array.isArray(processed)) {
              processed.forEach(p => {
                if (p && p.nodeType) {
                  newElement.appendChild(p);
                }
              });
            } else if (processed && processed.nodeType) {
              newElement.appendChild(processed);
            }
          });
          return newElement;
        }
      }
      return currentNode.cloneNode(true);
    };
    
    const childNodes = Array.from(node.childNodes);
    childNodes.forEach(child => {
      const processed = processNode(child);
      if (Array.isArray(processed)) {
        processed.forEach(p => {
          if (p && p.nodeType) {
            fragment.appendChild(p);
          }
        });
      } else if (processed && processed.nodeType) {
        fragment.appendChild(processed);
      }
    });
    
    return fragment;
  };

  const applyColorDirectly = (color) => {
    if (!savedSelectionRef.current || !editorRef.current) return;
    
    const { text, startOffset, endOffset } = savedSelectionRef.current;
    if (!text) return;
    

    
    // Try to restore the selection and use the proper color application
    const restored = restoreSelection(savedSelectionRef.current);
    if (restored) {
      applyColorToSelection(color);
    } else {
      // Fallback: try to find and replace the text with color
      const editorHTML = editorRef.current.innerHTML;
      
      // Remove existing color spans from the text we're looking for
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorHTML;
      
      // Simple approach: look for the text and wrap it
      const textNodes = getTextNodes(tempDiv);
      let found = false;
      
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const nodeText = node.textContent;
        const index = nodeText.indexOf(text);
        
        if (index !== -1) {
          // Split the text node
          const beforeText = nodeText.substring(0, index);
          const afterText = nodeText.substring(index + text.length);
          
          const parent = node.parentNode;
          
          // Create elements for before, colored text, and after
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), node);
          }
          
          const colorSpan = document.createElement('span');
          colorSpan.style.color = color;
          colorSpan.textContent = text;
          parent.insertBefore(colorSpan, node);
          
          if (afterText) {
            parent.insertBefore(document.createTextNode(afterText), node);
          }
          
          parent.removeChild(node);
          found = true;
          break;
        }
      }
      
      if (found) {
        editorRef.current.innerHTML = tempDiv.innerHTML;
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
        
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }, 0);
        

      } else {
        console.log('Failed to apply color - text not found');
      }
    }
  };

  const getTextNodes = (element) => {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    return textNodes;
  };

  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Create the heading element
    const heading = document.createElement(`h${level}`);
    heading.style.fontWeight = 'bold';
    heading.style.margin = '0.5em 0';
    
    // Set appropriate font size
    const sizes = {
      1: '2em',
      2: '1.5em',
      3: '1.25em'
    };
    heading.style.fontSize = sizes[level] || '1em';
    
    // Don't set any color - let it inherit or use inline styles
    
    // If there's selected text, use it as heading content
    if (!range.collapsed) {
      const selectedText = range.extractContents();
      heading.appendChild(selectedText);
    } else {
      heading.textContent = `Heading ${level}`;
    }
    
    // Insert the heading
    range.insertNode(heading);
    
    // Position cursor at end of heading
    const newRange = document.createRange();
    newRange.selectNodeContents(heading);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    // Trigger input event to save to history through normal flow
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const insertList = (type) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Check if we're already in a list and need to convert it
    const commonAncestor = range.commonAncestorContainer;
    const parentElement = commonAncestor.nodeType === Node.TEXT_NODE 
      ? commonAncestor.parentElement 
      : commonAncestor;
    
    // Find if we're inside a list
    let existingList = parentElement.closest('ul, ol');
    if (!existingList && editorRef.current.contains(parentElement)) {
      // Check if the selection contains a list
      const container = range.commonAncestorContainer;
      if (container.nodeType === Node.ELEMENT_NODE) {
        const lists = container.querySelectorAll('ul, ol');
        if (lists.length > 0) {
          existingList = lists[0];
        }
      }
    }
    
    // If we found an existing list, convert it
    if (existingList && editorRef.current.contains(existingList)) {
      const newListTag = type === 'bullet' ? 'ul' : 'ol';
      const currentListTag = existingList.tagName.toLowerCase();
      
      // If it's already the same type, do nothing
      if ((currentListTag === 'ul' && type === 'bullet') || 
          (currentListTag === 'ol' && type === 'numbered')) {
        return;
      }
      
      // Set flag to prevent cursor reset during update
      isUpdatingRef.current = true;
      
      // Create new list of different type
      const newList = document.createElement(newListTag);
      newList.style.listStyleType = type === 'bullet' ? 'disc' : 'decimal';
      newList.style.paddingLeft = existingList.style.paddingLeft || '2em';
      newList.style.margin = existingList.style.margin || '0.5em 0';
      
      // Copy all list items to the new list
      const listItems = existingList.querySelectorAll('li');
      listItems.forEach(li => {
        newList.appendChild(li.cloneNode(true));
      });
      
      // Replace the old list with the new one
      existingList.parentNode.replaceChild(newList, existingList);
      
      // Select all the list items to maintain the selection
      const newRange = document.createRange();
      newRange.setStartBefore(newList.firstElementChild.firstChild || newList.firstElementChild);
      newRange.setEndAfter(newList.lastElementChild.lastChild || newList.lastElementChild);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // Update content without triggering cursor reset
      // Use helper to ensure proper change detection and history saving
      notifyContentChange();
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
      
      return;
    }
    
    // Save cursor position before any changes
    const cursorBookmark = {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset,
      collapsed: range.collapsed
    };
    
    // Check if we have a multi-line selection
    if (!range.collapsed) {
      const selectedText = range.toString();
      
      // Split by various line separators and clean up
      let lines = selectedText.split(/\r?\n|\r/).filter(line => line.trim());
      
             // If no newlines, try to split by common patterns that might indicate separate items
       if (lines.length === 1) {
         // Look for patterns like "AWS revenue growth: 27% YoY to $30.2B Microsoft Azure growth: 29% YoY"
         // Try multiple splitting strategies
         
         // Strategy 1: Split by specific company names that we know are in the metrics
         let potentialLines = selectedText.split(/(?=\b(?:Microsoft\s+Azure|Google\s+Cloud|AWS)\b)/).filter(line => line.trim());
         
         // Strategy 2: If that didn't work, split by company names generally
         if (potentialLines.length === 1) {
           potentialLines = selectedText.split(/(?=\b(?:AWS|Microsoft|Google|Amazon|Apple|Meta|Netflix|Tesla|NVIDIA)\b)/).filter(line => line.trim());
         }
         
         // Strategy 3: Split by "revenue growth:" or "growth:" patterns
         if (potentialLines.length === 1) {
           potentialLines = selectedText.split(/(?<=(?:revenue\s+)?growth:\s*\d+%\s*YoY(?:\s+to\s+\$[\d.]+B)?)\s+(?=[A-Z])/).filter(line => line.trim());
         }
         
         // Strategy 4: Split by percentage patterns followed by text (more specific)
         if (potentialLines.length === 1) {
           potentialLines = selectedText.split(/(?<=\d+%\s+YoY(?:\s+to\s+\$[\d.]+B)?)\s+(?=[A-Z][a-z])/).filter(line => line.trim());
         }
         
         // Strategy 5: Split by "YoY" followed by capital letters
         if (potentialLines.length === 1) {
           potentialLines = selectedText.split(/(?<=YoY(?:\s+to\s+\$[\d.]+B)?)\s+(?=[A-Z][a-z])/).filter(line => line.trim());
         }
         
         if (potentialLines.length > 1) {
           lines = potentialLines;
         }
       }
       
       // If still only one line, try splitting by periods followed by capital letters
       if (lines.length === 1) {
         const potentialLines = selectedText.split(/\.\s+(?=[A-Z])/).filter(line => line.trim());
         if (potentialLines.length > 1) {
           lines = potentialLines.map(line => line.endsWith('.') ? line : line + '.');
         }
       }
      
      if (lines.length > 1) {
        // Set flag to prevent cursor reset during update
        isUpdatingRef.current = true;
        
        // Multi-line selection - create a list with multiple items
        const listTag = type === 'bullet' ? 'ul' : 'ol';
        const list = document.createElement(listTag);
        list.style.listStyleType = type === 'bullet' ? 'disc' : 'decimal';
        list.style.paddingLeft = '2em';
        list.style.margin = '0.5em 0';
        
        // Create list items for each line
        lines.forEach(line => {
          const listItem = document.createElement('li');
          listItem.style.display = 'list-item';
          listItem.textContent = line.trim();
          list.appendChild(listItem);
        });
        
        // Replace the selected content with the list
        range.deleteContents();
        range.insertNode(list);
        
        // Select all the list items to maintain the selection
        const newRange = document.createRange();
        newRange.setStartBefore(list.firstElementChild.firstChild || list.firstElementChild);
        newRange.setEndAfter(list.lastElementChild.lastChild || list.lastElementChild);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Update content without triggering cursor reset
        // Use helper to ensure proper change detection and history saving
        notifyContentChange();
        
        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 10);
        
        return;
      }
      
      // If we have a selection but it's across multiple DOM elements, try a different approach
      const fragment = range.cloneContents();
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment);
      
      // Get all text nodes and their content
      const textNodes = [];
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
          textNodes.push(node.textContent.trim());
        }
      }
      
      // If we found multiple text nodes, create list items
      if (textNodes.length > 1) {
        const listTag = type === 'bullet' ? 'ul' : 'ol';
        const list = document.createElement(listTag);
        list.style.listStyleType = type === 'bullet' ? 'disc' : 'decimal';
        list.style.paddingLeft = '2em';
        list.style.margin = '0.5em 0';
        
        // Create list items for each text node
        textNodes.forEach(text => {
          const listItem = document.createElement('li');
          listItem.style.display = 'list-item';
          listItem.textContent = text;
          list.appendChild(listItem);
        });
        
        // Replace the selected content with the list
        range.deleteContents();
        range.insertNode(list);
        
        // Select all the list items to maintain the selection
        const newRange = document.createRange();
        newRange.setStartBefore(list.firstElementChild.firstChild || list.firstElementChild);
        newRange.setEndAfter(list.lastElementChild.lastChild || list.lastElementChild);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Set flag to prevent cursor reset during update
        isUpdatingRef.current = true;
        
        // Update content without triggering cursor reset
        // Use helper to ensure proper change detection and history saving
        notifyContentChange();
        
        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 10);
        
        return;
      }
    }
    
    // Single line or cursor position - find the current line
    let currentNode = range.startContainer;
    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentNode;
    }
    
    // Find the closest block-level element
    let lineElement = currentNode;
    while (lineElement && lineElement !== editorRef.current && 
           !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(lineElement.tagName)) {
      lineElement = lineElement.parentNode;
    }
    
    // If we found a block element, convert it to a list
    if (lineElement && lineElement !== editorRef.current) {
      // Get the text content and preserve any formatting
      const content = lineElement.innerHTML.trim() || 'List item';
      
      // Create a new list element
      const listTag = type === 'bullet' ? 'ul' : 'ol';
      const list = document.createElement(listTag);
      list.style.listStyleType = type === 'bullet' ? 'disc' : 'decimal';
      list.style.paddingLeft = '2em';
      list.style.margin = '0.5em 0';
      
      const listItem = document.createElement('li');
      listItem.style.display = 'list-item';
      listItem.innerHTML = content;
      list.appendChild(listItem);
      
      // Set flag to prevent cursor reset during update
      isUpdatingRef.current = true;
      
      // Replace the block element with the list
      lineElement.parentNode.replaceChild(list, lineElement);
      
      // Select the entire list item content
      const newRange = document.createRange();
      newRange.selectNodeContents(listItem);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      // Update content without triggering cursor reset
      // Use helper to ensure proper change detection and history saving
      notifyContentChange();
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
    } else {
      // We're in the editor directly, work with the current line or selection
      if (range.collapsed) {
        // Single cursor position - find the current line
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const fullText = textNode.textContent;
          const cursorPosition = range.startOffset;
          const lineStart = fullText.lastIndexOf('\n', cursorPosition - 1) + 1;
          const lineEnd = fullText.indexOf('\n', cursorPosition);
          const lineText = fullText.substring(lineStart, lineEnd === -1 ? fullText.length : lineEnd);
          
          if (lineText.trim()) {
            // Create a new list element
            const listTag = type === 'bullet' ? 'ul' : 'ol';
            const list = document.createElement(listTag);
            list.style.listStyleType = type === 'bullet' ? 'disc' : 'decimal';
            list.style.paddingLeft = '2em';
            list.style.margin = '0.5em 0';
            
            const listItem = document.createElement('li');
            listItem.style.display = 'list-item';
            listItem.textContent = lineText.trim();
            list.appendChild(listItem);
            
            // Replace the current line with the list
            const lineRange = document.createRange();
            lineRange.setStart(textNode, lineStart);
            lineRange.setEnd(textNode, lineEnd === -1 ? fullText.length : lineEnd);
            lineRange.deleteContents();
            lineRange.insertNode(list);
            
            // Set flag to prevent cursor reset during update
            isUpdatingRef.current = true;
            
            // Select the entire list item content
            const newRange = document.createRange();
            newRange.selectNodeContents(listItem);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Update content without triggering cursor reset
            // Use helper to ensure proper change detection and history saving
            notifyContentChange();
            
            // Reset the flag after a short delay
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 10);
          }
        }
      } else {
        // Single line selection - convert to single list item
        const selectedText = range.toString().trim();
        if (selectedText) {
          // Set flag to prevent cursor reset during update
          isUpdatingRef.current = true;
          
          const listTag = type === 'bullet' ? 'ul' : 'ol';
          const list = document.createElement(listTag);
          list.style.listStyleType = type === 'bullet' ? 'disc' : 'decimal';
          list.style.paddingLeft = '2em';
          list.style.margin = '0.5em 0';
          
          const listItem = document.createElement('li');
          listItem.style.display = 'list-item';
          listItem.textContent = selectedText;
          list.appendChild(listItem);
          
          // Replace the selected content with the list
          range.deleteContents();
          range.insertNode(list);
          
          // Select the entire list item content
          const newRange = document.createRange();
          newRange.selectNodeContents(listItem);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          // Update content without triggering cursor reset
          // Use helper to ensure proper change detection and history saving
          notifyContentChange();
          
          // Reset the flag after a short delay
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 10);
        }
      }
    }
  };

  const indentText = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Check if we have a multi-element selection
    if (!range.collapsed) {
      // First, check if this is a multi-line plain text selection
      const selectedText = range.toString();
      const lines = selectedText.split(/\r?\n|\r/).filter(line => line.trim());
      
      if (lines.length > 1) {
        // This is multi-line plain text - create individual elements for each line
        const startContainer = range.startContainer;
        
        if (startContainer.nodeType === Node.TEXT_NODE) {
          // Create a container div to hold all the lines
          const containerDiv = document.createElement('div');
          
          // Create paragraph elements for each line
          lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line.trim();
            p.style.marginLeft = '2em'; // Apply standard indent
            containerDiv.appendChild(p);
          });
          
          // Replace the selected text with the new structure
          range.deleteContents();
          
          // Insert each paragraph separately
          const paragraphs = containerDiv.children;
          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i].cloneNode(true);
            range.insertNode(p);
            range.setStartAfter(p);
          }
          
          // Position cursor at end of last inserted paragraph
          // The range is already positioned after the last inserted element
          
          // Don't update content state immediately
          return;
        }
      }
      
      const fragment = range.cloneContents();
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment);
      
      // Find all block elements in the selection
      const blockElements = [];
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: function(node) {
            if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(node.tagName)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        },
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        blockElements.push(node);
      }
      
      // If we found multiple block elements, find and indent them all in the actual DOM
      if (blockElements.length > 1) {
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        
        // Find all elements between start and end in the actual DOM
        const elementsToIndent = [];
        const treeWalker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: function(node) {
              if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(node.tagName)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            }
          },
          false
        );
        
        let currentNode;
        let foundStart = false;
        while (currentNode = treeWalker.nextNode()) {
          if (!foundStart) {
            // Check if this element contains the start of selection
            if (currentNode.contains(startContainer) || currentNode === startContainer) {
              foundStart = true;
              elementsToIndent.push(currentNode);
            }
          } else {
            // We're collecting elements until we reach the end
            elementsToIndent.push(currentNode);
            if (currentNode.contains(endContainer) || currentNode === endContainer) {
              break;
            }
          }
        }
        
        // Indent all found elements
        elementsToIndent.forEach(element => {
          const currentMargin = parseFloat(element.style.marginLeft) || 0;
          
          // If we have a negative margin (from outdenting), first bring it back to 0, then add indentation
          if (currentMargin < 0) {
            element.style.marginLeft = '2em';
          } else {
            element.style.marginLeft = `${currentMargin + 2}em`;
          }
        });
        
        // Manually trigger input event
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
        return;
      }
    }
    
    // Find the current line/block element - be more aggressive in finding elements
    let currentNode = range.startContainer;
    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentNode;
    }
    
    // Look for any element that can be indented, including nested elements
    let lineElement = currentNode;
    while (lineElement && lineElement !== editorRef.current) {
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(lineElement.tagName)) {
        break;
      }
      lineElement = lineElement.parentNode;
    }
    
    if (lineElement && lineElement !== editorRef.current && lineElement.tagName) {
      // Add or increase left margin
      const currentMargin = parseFloat(lineElement.style.marginLeft) || 0;
      
      // If we have a negative margin (from outdenting), first bring it back to 0, then add indentation
      if (currentMargin < 0) {
        lineElement.style.marginLeft = '2em';
      } else {
        lineElement.style.marginLeft = `${currentMargin + 2}em`;
      }
      
      // Manually trigger input event
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    } else {
      // We're dealing with inline text or couldn't find a suitable element
      // Create a div wrapper to handle complex text structures
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
        // Find the parent that's a direct child of the editor
        let parentElement = textNode.parentNode;
        while (parentElement && parentElement.parentNode !== editorRef.current) {
          parentElement = parentElement.parentNode;
        }
        
                 if (parentElement && parentElement.parentNode === editorRef.current) {
           // Indent the parent element
           const currentMargin = parseFloat(parentElement.style.marginLeft) || 0;
           
           // If we have a negative margin (from outdenting), first bring it back to 0, then add indentation
           if (currentMargin < 0) {
             parentElement.style.marginLeft = '2em';
           } else {
             parentElement.style.marginLeft = `${currentMargin + 2}em`;
           }
           
           // Manually trigger input event
           const event = new Event('input', { bubbles: true });
           editorRef.current.dispatchEvent(event);
         } else {
          // Last resort - wrap in a div
          const div = document.createElement('div');
          div.style.marginLeft = '2em';
          div.style.margin = '0.5em 0';
          
          // Get the current line text
          const fullText = textNode.textContent;
          const cursorPosition = range.startOffset;
          const lineStart = fullText.lastIndexOf('\n', cursorPosition - 1) + 1;
          const lineEnd = fullText.indexOf('\n', cursorPosition);
          const lineText = fullText.substring(lineStart, lineEnd === -1 ? fullText.length : lineEnd);
          
          if (lineText.trim()) {
            div.textContent = lineText.trim();
            
            // Replace the current line with the div
            const lineRange = document.createRange();
            lineRange.setStart(textNode, lineStart);
            lineRange.setEnd(textNode, lineEnd === -1 ? fullText.length : lineEnd);
            lineRange.deleteContents();
            lineRange.insertNode(div);
            
            // Position cursor at end of div
            const newRange = document.createRange();
            newRange.selectNodeContents(div);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Manually trigger input event and save to history
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
            
            // Save to history immediately for undo functionality
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            
            if (onChange) {
              onChange(newContent);
            }
          }
        }
      }
    }
  };

  const outdentText = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
        // Check if we have a multi-element selection
    if (!range.collapsed) {
      // First, check if this is a multi-line plain text selection
      const selectedText = range.toString();
      const lines = selectedText.split(/\r?\n|\r/).filter(line => line.trim());
      
      if (lines.length > 1) {
        // This is multi-line plain text - create individual elements for each line
        const startContainer = range.startContainer;
        
        if (startContainer.nodeType === Node.TEXT_NODE) {
          // Create a container div to hold all the lines
          const containerDiv = document.createElement('div');
          
          // Create paragraph elements for each line
          lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line.trim();
            
            // Apply safety check for outdenting
            const currentMargin = 0; // New paragraphs start at 0
            if (currentMargin >= -1.5) {
              p.style.marginLeft = '-1.5em';
            }
            
            containerDiv.appendChild(p);
          });
          
          // Replace the selected text with the new structure
          range.deleteContents();
          
          // Insert each paragraph separately
          const paragraphs = containerDiv.children;
          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i].cloneNode(true);
            range.insertNode(p);
            range.setStartAfter(p);
          }
          
          // Position cursor at end of last inserted paragraph
          // The range is already positioned after the last inserted element
          
          // Don't update content state immediately
          return;
        }
      }
      
      const fragment = range.cloneContents();
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment);
      
      // Find all block elements in the selection
      const blockElements = [];
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: function(node) {
            if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(node.tagName)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        },
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        blockElements.push(node);
      }
      
      // If we found multiple block elements, find and outdent them all in the actual DOM
      if (blockElements.length > 1) {
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        
        // Find all elements between start and end in the actual DOM
        const elementsToOutdent = [];
        const treeWalker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: function(node) {
              if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(node.tagName)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            }
          },
          false
        );
        
        let currentNode;
        let foundStart = false;
        while (currentNode = treeWalker.nextNode()) {
          if (!foundStart) {
            // Check if this element contains the start of selection
            if (currentNode.contains(startContainer) || currentNode === startContainer) {
              foundStart = true;
              elementsToOutdent.push(currentNode);
            }
          } else {
            // We're collecting elements until we reach the end
            elementsToOutdent.push(currentNode);
            if (currentNode.contains(endContainer) || currentNode === endContainer) {
              break;
            }
          }
        }
        
                 // Outdent all found elements
         elementsToOutdent.forEach(element => {
           // If this is a list item, work with its parent list instead
           let targetElement = element;
           if (element.tagName === 'LI' && element.parentNode) {
             targetElement = element.parentNode;
           }
           
           const currentCustomMargin = parseFloat(targetElement.style.marginLeft) || 0;
           
           if (currentCustomMargin > 0) {
             const newMargin = Math.max(0, currentCustomMargin - 2);
             if (newMargin === 0) {
               targetElement.style.marginLeft = '';
             } else {
               targetElement.style.marginLeft = `${newMargin}em`;
             }
           } else {
             if (targetElement.tagName === 'P') {
               const currentMargin = parseFloat(targetElement.style.marginLeft) || 0;
               // Only outdent if we haven't already reached the minimum safe position
               if (currentMargin > -1.5) {
                 targetElement.style.marginLeft = '-1.5em';
               }
             } else if (targetElement.tagName === 'UL' || targetElement.tagName === 'OL') {
               const currentMargin = parseFloat(targetElement.style.marginLeft) || 0;
               // Lists need a different minimum because they have different default styling
               if (currentMargin > -2.0) {
                 targetElement.style.marginLeft = '-2.0em';
               }
             }
           }
           
           // Remove indentation classes
           if (targetElement.className) {
             targetElement.className = targetElement.className.replace(/\bpl-\d+\b|\bml-\d+\b/g, '').trim();
           }
         });
        
        // Manually trigger input event
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
        return;
      }
    }
    
    // Find the current line/block element - be more aggressive in finding elements
    let currentNode = range.startContainer;
    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentNode;
    }
    
    // Look for any element that can be outdented, including nested elements
    let lineElement = currentNode;
    while (lineElement && lineElement !== editorRef.current) {
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL'].includes(lineElement.tagName)) {
        break;
      }
      lineElement = lineElement.parentNode;
    }
    
    // If we found a list item, work with its parent list instead
    if (lineElement && lineElement.tagName === 'LI') {
      lineElement = lineElement.parentNode;
    }
    
    if (lineElement && lineElement !== editorRef.current && lineElement.tagName) {
      // Get current custom margin (not including prose defaults)
      const currentCustomMargin = parseFloat(lineElement.style.marginLeft) || 0;
      
      if (currentCustomMargin > 0) {
        // If we have custom indentation, reduce it
        const newMargin = Math.max(0, currentCustomMargin - 2);
        if (newMargin === 0) {
          lineElement.style.marginLeft = '';
        } else {
          lineElement.style.marginLeft = `${newMargin}em`;
        }
      } else {
        // No custom indentation, so we need to counteract the prose default
        // Use negative margin to align with default paragraph position, but don't go too far
        if (lineElement.tagName === 'P') {
          const currentMargin = parseFloat(lineElement.style.marginLeft) || 0;
          // Only outdent if we haven't already reached the minimum safe position
          if (currentMargin > -1.5) {
            lineElement.style.marginLeft = '-1.5em';
          }
        } else if (lineElement.tagName === 'UL' || lineElement.tagName === 'OL') {
          const currentMargin = parseFloat(lineElement.style.marginLeft) || 0;
          // Lists need a different minimum because they have different default styling
          if (currentMargin >= -2.0) {
            lineElement.style.marginLeft = '-2.0em';
          }
        }
      }
      
      // Also remove any CSS classes that might add indentation
      if (lineElement.className) {
        lineElement.className = lineElement.className.replace(/\bpl-\d+\b|\bml-\d+\b/g, '').trim();
      }
      
      // Don't update content state - let handleInput handle it naturally when user continues typing
    } else {
      // We're dealing with inline text or couldn't find a suitable element
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
                 // Find the parent that's a direct child of the editor
         let parentElement = textNode.parentNode;
         while (parentElement && parentElement.parentNode !== editorRef.current) {
           parentElement = parentElement.parentNode;
         }
         
         // If we found a list item, work with its parent list instead
         if (parentElement && parentElement.tagName === 'LI') {
           parentElement = parentElement.parentNode;
         }
         
         if (parentElement && parentElement.parentNode === editorRef.current) {
           // Get current custom margin (not including prose defaults)
           const currentCustomMargin = parseFloat(parentElement.style.marginLeft) || 0;
           
           if (currentCustomMargin > 0) {
             // If we have custom indentation, reduce it
             const newMargin = Math.max(0, currentCustomMargin - 2);
             if (newMargin === 0) {
               parentElement.style.marginLeft = '';
             } else {
               parentElement.style.marginLeft = `${newMargin}em`;
             }
           } else {
             // No custom indentation, so we need to counteract the prose default
             // Use negative margin to align with default paragraph position, but don't go too far
             if (parentElement.tagName === 'P') {
               const currentMargin = parseFloat(parentElement.style.marginLeft) || 0;
               // Only outdent if we haven't already reached the minimum safe position
               if (currentMargin > -1.5) {
                 parentElement.style.marginLeft = '-1.5em';
               }
             } else if (parentElement.tagName === 'UL' || parentElement.tagName === 'OL') {
               const currentMargin = parseFloat(parentElement.style.marginLeft) || 0;
               // Lists need a different minimum because they have different default styling
               if (currentMargin > -2.0) {
                 parentElement.style.marginLeft = '-2.0em';
               }
             }
           }
           
           // Also remove any CSS classes that might add indentation
           if (parentElement.className) {
             parentElement.className = parentElement.className.replace(/\bpl-\d+\b|\bml-\d+\b/g, '').trim();
           }
          
          // Manually trigger input event and save to history
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
          
          // Save to history immediately for undo functionality
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          
          if (onChange) {
            onChange(newContent);
          }
        }
      }
    }
  };

  const insertHorizontalRule = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    // Create a horizontal rule with proper styling
    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '2px solid #e5e7eb';
    hr.style.margin = '1.5em 0';
    hr.style.height = '0';
    
    // Create a new paragraph after the hr for continued editing
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = '<br>'; // Use br for proper cursor positioning
    
    const range = selection.getRangeAt(0);
    
    // If there's selected content, delete it
    if (!range.collapsed) {
      range.deleteContents();
    }
    
    // Insert a line break before the hr to ensure proper spacing
    const lineBreak = document.createElement('br');
    range.insertNode(lineBreak);
    
    // Insert the hr after the line break
    range.setStartAfter(lineBreak);
    range.insertNode(hr);
    
    // Insert the paragraph after the hr
    range.setStartAfter(hr);
    range.insertNode(newParagraph);
    
    // Position cursor in the new paragraph
    const newRange = document.createRange();
    newRange.setStart(newParagraph, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    // Manually trigger input event and save to history
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
    
    // Save to history immediately for undo functionality
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Check if we're already in a blockquote
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentNode;
    }
    const existingBlockquote = container.closest('blockquote');
    
    if (existingBlockquote) {
      // Convert blockquote back to paragraph
      const p = document.createElement('p');
      p.innerHTML = existingBlockquote.innerHTML;
      existingBlockquote.parentNode.replaceChild(p, existingBlockquote);
      
      // Position cursor in the new paragraph
      range.selectNodeContents(p);
      range.collapse(true);
    } else {
      // Create blockquote
      const blockquote = document.createElement('blockquote');
      blockquote.style.cssText = 'margin: 1em 0; padding: 1em 1.5em; border-left: 4px solid #046B4E; background: #f8f9fa; font-style: italic; color: #374151;';
      
      if (range.collapsed) {
        // No selection, create empty blockquote
        blockquote.innerHTML = 'Quote or key insight here...';
        range.insertNode(blockquote);
        
        // Select the placeholder text
        range.selectNodeContents(blockquote);
      } else {
        // Wrap selected content in blockquote
        const contents = range.extractContents();
        blockquote.appendChild(contents);
        range.insertNode(blockquote);
        
        // Position cursor at end of blockquote
        range.selectNodeContents(blockquote);
        range.collapse(false);
      }
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input event and save to history
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
    
    // Save to history immediately for undo functionality
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertCallout = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Create callout box
    const callout = document.createElement('div');
    callout.className = 'callout-box';
    callout.style.cssText = 'margin: 1.5em 0; padding: 1.5em; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #10b981; border-radius: 8px; position: relative;';
    
    // Add callout icon
    const icon = document.createElement('div');
    icon.innerHTML = '💡';
    icon.style.cssText = 'position: absolute; top: 1em; left: 1em; font-size: 1.2em;';
    callout.appendChild(icon);
    
    // Add content area
    const content = document.createElement('div');
    content.style.cssText = 'margin-left: 2.5em;';
    
    if (range.collapsed) {
      // No selection, create empty callout
      content.innerHTML = '<strong>Key Insight:</strong> Add your important information here...';
    } else {
      // Wrap selected content in callout
      const contents = range.extractContents();
      content.appendChild(contents);
    }
    
    callout.appendChild(content);
    range.insertNode(callout);
    
    // Position cursor in content area
    range.selectNodeContents(content);
    if (range.collapsed) {
      range.collapse(false);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input event and save to history
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
    
    // Save to history immediately for undo functionality
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertSimpleTable = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Create table
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9em;';
    
    // Create table structure (2x3 by default)
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Header row
    const headerRow = document.createElement('tr');
    for (let i = 0; i < 3; i++) {
      const th = document.createElement('th');
      th.style.cssText = 'border: 1px solid #d1d5db; padding: 0.75em; background: #f3f4f6; font-weight: 600; text-align: left;';
      th.textContent = `Header ${i + 1}`;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    
    // Data rows
    for (let row = 0; row < 2; row++) {
      const tr = document.createElement('tr');
      for (let col = 0; col < 3; col++) {
        const td = document.createElement('td');
        td.style.cssText = 'border: 1px solid #d1d5db; padding: 0.75em;';
        td.textContent = `Cell ${row + 1},${col + 1}`;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    // Insert table
    range.insertNode(table);
    
    // Create paragraph after table for continued editing
    const newP = document.createElement('p');
    newP.innerHTML = '<br>';
    table.parentNode.insertBefore(newP, table.nextSibling);
    
    // Position cursor in first cell
    const firstCell = table.querySelector('th');
    range.selectNodeContents(firstCell);
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input event and save to history
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
    
    // Save to history immediately for undo functionality
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  };

  const undo = useCallback(() => {
    console.log('=== UNDO OPERATION ===');
    console.log('Undo called - historyIndex:', historyIndex, 'history length:', history.length);
    if (historyIndex > 0 && history.length > 1) {
      isUpdatingRef.current = true;
      const newIndex = historyIndex - 1;
      const previousContent = history[newIndex];
      console.log('Undoing to index:', newIndex);
      console.log('Previous content preview:', previousContent?.substring(0, 100));
      console.log('Current DOM content before undo:', editorRef.current?.innerHTML?.substring(0, 100));
      
      // Update state first
      setContent(previousContent);
      setHistoryIndex(newIndex);
      
      // Calculate word count and reading time for restored content
      const text = previousContent.replace(/<[^>]*>/g, ''); // Remove HTML tags
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.ceil(words / 200);
      setWordCount(words);
      setReadingTime(minutes);
      
      // Update DOM
      if (editorRef.current) {
        console.log('Updating DOM with previous content...');
        console.log('Previous content to restore:', previousContent.substring(0, 100));
        
        // Update DOM content directly
        editorRef.current.innerHTML = previousContent;
        
        console.log('DOM content after update:', editorRef.current.innerHTML?.substring(0, 100));
        
        // Set cursor to end of content
        const range = document.createRange();
        const selection = window.getSelection();
        
        // Find the last text node or element
        const lastNode = editorRef.current.lastChild;
        if (lastNode) {
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.textContent.length);
            range.setEnd(lastNode, lastNode.textContent.length);
          } else {
            range.selectNodeContents(lastNode);
            range.collapse(false);
          }
        } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
        editorRef.current.focus();
        console.log('Cursor positioned and editor focused');
      }
      
      // Notify parent
      if (onChange) {
        onChange(previousContent);
      }
      
      setTimeout(() => {
        isUpdatingRef.current = false;
        console.log('=== UNDO COMPLETE ===');
      }, 10);
    } else {
      console.log('Cannot undo - no previous history or invalid state');
    }
  }, [historyIndex, history, onChange]);

  const redo = useCallback(() => {
    console.log('Redo called - historyIndex:', historyIndex, 'history length:', history.length);
    if (historyIndex < history.length - 1) {
      isUpdatingRef.current = true;
      const newIndex = historyIndex + 1;
      const nextContent = history[newIndex];
      console.log('Redoing to index:', newIndex, 'content preview:', nextContent?.substring(0, 50));
      
      // Update state first
      setContent(nextContent);
      setHistoryIndex(newIndex);
      
      // Calculate word count and reading time for restored content
      const text = nextContent.replace(/<[^>]*>/g, ''); // Remove HTML tags
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const minutes = Math.ceil(words / 200);
      setWordCount(words);
      setReadingTime(minutes);
      
      // Update DOM
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
        
        // Set cursor to end of content
        const range = document.createRange();
        const selection = window.getSelection();
        
        // Find the last text node or element
        const lastNode = editorRef.current.lastChild;
        if (lastNode) {
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.textContent.length);
            range.setEnd(lastNode, lastNode.textContent.length);
          } else {
            range.selectNodeContents(lastNode);
            range.collapse(false);
          }
        } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
        editorRef.current.focus();
      }
      
      // Notify parent
      if (onChange) {
        onChange(nextContent);
      }
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
    } else {
      console.log('Cannot redo - no future history');
    }
  }, [historyIndex, history, onChange]);

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        // Ctrl+Z for undo
        e.preventDefault();
        undo();
      } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        // Ctrl+Y or Ctrl+Shift+Z for redo
        e.preventDefault();
        redo();
      }
    };

    editor.addEventListener('keydown', handleKeyDown);
    return () => editor.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const colors = [
    { name: 'Default', value: 'default', className: 'text-gray-900 dark:text-white' },
    { name: 'Black', value: '#000000', className: 'text-black' },
    { name: 'White', value: '#FFFFFF', className: 'text-white' },
    { name: 'Navy', value: '#1a3a5f', className: 'text-navy-700' },
    { name: 'Teal', value: '#046B4E', className: 'text-teal-600' },
    { name: 'Blue', value: '#3B82F6', className: 'text-blue-500' },
    { name: 'Green', value: '#10B981', className: 'text-green-500' },
    { name: 'Red', value: '#EF4444', className: 'text-red-500' },
    { name: 'Orange', value: '#F59E0B', className: 'text-orange-500' },
    { name: 'Purple', value: '#8B5CF6', className: 'text-purple-500' },
    { name: 'Gray', value: '#6B7280', className: 'text-gray-500' },
  ];

  const getColorSwatchStyle = (color) => {
    if (color.value === 'default') {
      // Checkerboard pattern for default/transparent
      return {
        background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
        backgroundSize: '4px 4px',
        backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
      };
    } else if (color.value.startsWith('#')) {
      // Hex color
      return {
        backgroundColor: color.value
      };
    } else {
      // For colors that don't have hex values, use a representative color
      const colorMap = {
        'text-navy-700': '#1a3a5f',
        'text-teal-600': '#046B4E',
        'text-blue-500': '#3B82F6',
        'text-green-500': '#10B981',
        'text-red-500': '#EF4444',
        'text-orange-500': '#F59E0B',
        'text-purple-500': '#8B5CF6',
        'text-gray-500': '#6B7280'
      };
      return {
        backgroundColor: colorMap[color.className] || color.value
      };
    }
  };

  const getButtonClass = (isActive = false) => {
    return `px-3 py-1 rounded text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-teal-500 text-white' 
        : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'
    }`;
  };

  const getWordCount = () => {
    if (!editorRef.current) return 0;
    const text = editorRef.current.textContent || '';
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = () => {
    const wordCount = getWordCount();
    const wordsPerMinute = 200; // Average reading speed
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  // Sync content state with DOM when component unmounts or when needed
  useEffect(() => {
    return () => {
      // Sync content state with DOM before unmounting
      if (editorRef.current) {
        const finalContent = editorRef.current.innerHTML;
        setContent(finalContent);
        if (onChange) {
          onChange(finalContent);
        }
      }
    };
  }, []); // Remove onChange from dependencies to prevent infinite loop

  if (!isClient) {
    return (
      <div className="min-h-[300px] p-4 rounded border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-gray-900 dark:text-white">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-700 select-none">
        {/* Text Formatting */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => toggleFormat('strong')}
            className={getButtonClass()}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => toggleFormat('em')}
            className={getButtonClass()}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => toggleFormat('u')}
            className={getButtonClass()}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        {/* Headings */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => insertHeading(1)}
            className={`${getButtonClass()} text-lg font-bold`}
            title="Heading 1"
          >
            H1
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => insertHeading(2)}
            className={`${getButtonClass()} text-base font-semibold`}
            title="Heading 2"
          >
            H2
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => insertHeading(3)}
            className={`${getButtonClass()} text-sm font-medium`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => insertList('bullet')}
            className={getButtonClass()}
            title="Bullet List"
          >
            •
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => insertList('numbered')}
            className={getButtonClass()}
            title="Numbered List"
          >
            1.
          </button>
        </div>

        {/* Indent/Outdent */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={outdentText}
            className={getButtonClass()}
            title="Decrease Indent"
          >
            ←
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={indentText}
            className={getButtonClass()}
            title="Increase Indent"
          >
            →
          </button>
        </div>

        {/* Professional Formatting */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={insertHorizontalRule}
            className={getButtonClass()}
            title="Horizontal Rule / Divider"
          >
            ─
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={insertBlockquote}
            className={getButtonClass()}
            title="Blockquote"
          >
            &quot;
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={insertCallout}
            className={getButtonClass()}
            title="Callout Box"
          >
            💡
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={insertSimpleTable}
            className={getButtonClass()}
            title="Insert Table"
          >
            ⊞
          </button>
        </div>

        {/* Colors */}
        <div className="flex flex-wrap gap-1">
          <div className="relative color-picker-container">
                        <div
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                e.stopPropagation(); // Prevent event bubbling
                
                // Save current selection before any changes
                savedSelectionRef.current = saveSelection();
                
                setShowColorPicker(!showColorPicker);
                
                // Keep the selection visible while color picker is open
                if (!showColorPicker && savedSelectionRef.current) {
                  setTimeout(() => {
                    if (editorRef.current) {
                      editorRef.current.focus();
                      restoreSelection(savedSelectionRef.current);
                    }
                  }, 0);
                }
              }}
              className={`${getButtonClass()} cursor-pointer inline-flex items-center justify-center`}
              title="Text Color"
            >
              🎨
            </div>
            {showColorPicker && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-lg shadow-lg p-2 z-10 min-w-[200px]"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent losing focus when clicking in color picker
                  e.stopPropagation(); // Prevent event bubbling
                }}
              >
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Text Color</div>
                <div className="grid grid-cols-3 gap-1">
                  {colors.map((color) => (
                    <div
                      key={color.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTextColor(color.value);
                      }}
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-700 text-xs cursor-pointer"
                      title={color.name}
                    >
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 dark:border-navy-600 mx-auto mb-1"
                        style={getColorSwatchStyle(color)}
                      />
                      <div className="text-gray-700 dark:text-gray-300">{color.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={undo}
            className={`${getButtonClass()} ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Undo"
            disabled={historyIndex <= 0}
          >
            ↺
          </button>
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={redo}
            className={`${getButtonClass()} ${historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            ↻
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button" 
              onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
              onClick={debugHistory}
              className={getButtonClass()}
              title="Debug History"
            >
              🐛
            </button>
          )}
        </div>

        {/* HTML Mode Toggle */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={toggleHtmlMode}
            className={`${getButtonClass()} ${htmlMode ? 'bg-teal-500 text-white' : ''}`}
            title={htmlMode ? "Switch to Visual Mode" : "Switch to HTML Mode"}
          >
            &lt;/&gt;
          </button>
        </div>

        {/* Word Count and Reading Time */}
        <div className="flex items-center gap-4 ml-auto text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readingTime} min read
          </span>
        </div>
      </div>

      {/* Editor */}
      {htmlMode ? (
        <textarea
          ref={textareaRef}
          value={htmlContent}
          onChange={handleHtmlInput}
          className="min-h-[300px] p-4 rounded border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors font-mono text-sm resize-y w-full"
          placeholder="Enter HTML code here..."
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable="true"
          onInput={handleInput}
          className="rich-text-editor-content min-h-[300px] p-4 rounded border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          style={{
            fontSize: '16px',
            lineHeight: '1.75',
            fontFamily: 'inherit',
          }}
          suppressContentEditableWarning={true}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .rich-text-editor-content {
          line-height: 1.75;
          font-size: 16px;
          color: #111827; /* gray-900 */
        }
        
        @media (prefers-color-scheme: dark) {
          .rich-text-editor-content {
            color: #ffffff;
          }
        }
        
        /* Dark mode override */
        .dark .rich-text-editor-content {
          color: #ffffff;
        }
        
        /* Remove any color inheritance that might interfere */
        .rich-text-editor-content * {
          color: inherit;
        }
        
        /* Let inline styles work by not setting any color on these */
        .rich-text-editor-content span[style*="color"] {
          /* Inline styles should have precedence */
        }
        
        .rich-text-editor-content div {
          margin: 0.5em 0;
          line-height: inherit;
        }
        
        .rich-text-editor-content p {
          margin: 0.75em 0;
          line-height: inherit;
        }
        
        .rich-text-editor-content br {
          display: block;
          content: "";
          margin-top: 0;
        }
        
        /* Override all possible heading styles with highest specificity */
        .rich-text-editor-content h1,
        .rich-text-editor-content h1:not(.ignore),
        div.rich-text-editor-content h1 {
          font-size: 2em !important;
          font-weight: bold !important;
          margin: 0.75em 0 !important;
          line-height: 1.3 !important;
          color: inherit !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .rich-text-editor-content h2,
        .rich-text-editor-content h2:not(.ignore),
        div.rich-text-editor-content h2 {
          font-size: 1.5em !important;
          font-weight: bold !important;
          margin: 0.75em 0 !important;
          line-height: 1.3 !important;
          color: inherit !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .rich-text-editor-content h3,
        .rich-text-editor-content h3:not(.ignore),
        div.rich-text-editor-content h3 {
          font-size: 1.25em !important;
          font-weight: bold !important;
          margin: 0.75em 0 !important;
          line-height: 1.3 !important;
          color: inherit !important;
          border: none !important;
          padding: 0 !important;
        }
        
        /* Ensure inline styles always win */
        .rich-text-editor-content [style*="color"] {
          /* Inline color styles should override everything */
        }
        
        .rich-text-editor-content h4,
        .rich-text-editor-content h5,
        .rich-text-editor-content h6 {
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        

        

        
        .rich-text-editor-content ul {
          list-style-type: disc;
          list-style-position: outside;
          margin: 0.75em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor-content ol {
          list-style-type: decimal;
          list-style-position: outside;
          margin: 0.75em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor-content li {
          margin: 0.25em 0;
          display: list-item;
        }
        
        .rich-text-editor-content strong,
        .rich-text-editor-content b {
          font-weight: bold;
        }
        
        .rich-text-editor-content em,
        .rich-text-editor-content i {
          font-style: italic;
        }
        
        .rich-text-editor-content u {
          text-decoration: underline;
        }
        
        .rich-text-editor-content a[href] {
          color: #14b8a6;
          text-decoration: underline;
        }
        
        /* Default text colors for editor content */
        .rich-text-editor-content {
          color: #374151 !important;
        }
        
        .rich-text-editor-content p {
          color: #374151 !important;
        }
        
        .rich-text-editor-content h1,
        .rich-text-editor-content h2, 
        .rich-text-editor-content h3,
        .rich-text-editor-content h4,
        .rich-text-editor-content h5,
        .rich-text-editor-content h6 {
          color: #1a3a5f !important;
        }
        
        .rich-text-editor-content div {
          color: #374151 !important;
        }

        
        .rich-text-editor-content blockquote {
          margin: 1em 0;
          padding: 1em 1.5em;
          border-left: 4px solid #046B4E;
          background: #f8f9fa;
          font-style: italic;
          color: #374151;
        }
        
        .rich-text-editor-content .callout-box {
          margin: 1.5em 0;
          padding: 1.5em;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #10b981;
          border-radius: 8px;
          position: relative;
        }
        
        .rich-text-editor-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .rich-text-editor-content table th {
          background: linear-gradient(135deg, #046B4E 0%, #0d9488 100%);
          color: white;
          font-weight: 600;
          padding: 12px 16px;
          text-align: left;
          border: none;
        }
        
        .rich-text-editor-content table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }
        
        .rich-text-editor-content table tr:nth-child(even) td {
          background: #f9fafb;
        }
        
        .rich-text-editor-content table tr:hover td {
          background: #f3f4f6;
        }
        
        .rich-text-editor-content .callout-box {
          margin: 1.5em 0;
          padding: 1.5em;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #10b981;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .rich-text-editor-content .callout-box::before {
          content: "💡";
          position: absolute;
          top: -8px;
          left: 20px;
          background: white;
          padding: 4px 8px;
          border-radius: 50%;
          font-size: 14px;
        }
        
        .rich-text-editor-content blockquote {
          margin: 1.5em 0;
          padding: 1.5em 2em;
          border-left: 4px solid #046B4E;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #374151;
          position: relative;
        }
        
        .rich-text-editor-content blockquote::before {
          content: """;
          position: absolute;
          top: -10px;
          left: 20px;
          font-size: 48px;
          color: #046B4E;
          font-family: serif;
        }
        
        .rich-text-editor-content hr {
          margin: 2em 0;
          border: none;
          border-top: 2px solid #046B4E;
          position: relative;
        }
        
        .rich-text-editor-content hr::after {
          content: "◆";
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 8px;
          color: #046B4E;
          font-size: 12px;
        }
        
        .rich-text-editor-content ul, .rich-text-editor-content ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor-content ul li {
          margin: 0.5em 0;
          position: relative;
        }
        
        .rich-text-editor-content ul li::marker {
          color: #046B4E;
          font-weight: bold;
        }
        
        .rich-text-editor-content ol li {
          margin: 0.5em 0;
          padding-left: 0.5em;
        }
        
        .rich-text-editor-content ol li::marker {
          color: #046B4E;
          font-weight: bold;
        }
        
        .rich-text-editor-content h1 {
          background: linear-gradient(135deg, #1a3a5f 0%, #046B4E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          border-bottom: 3px solid #046B4E;
          padding-bottom: 0.5em;
          margin-bottom: 1em;
        }
        
        .rich-text-editor-content h2 {
          color: #1a3a5f !important;
          border-left: 4px solid #046B4E;
          padding-left: 1em;
          margin-left: -1em;
        }
        
        .rich-text-editor-content h3 {
          color: #046B4E !important;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5em;
        }
        
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] .tiptap-bullet-list {
          list-style-type: disc;
          list-style-position: outside;
          margin: 0.5em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor [contenteditable] ol,
        .rich-text-editor [contenteditable] .tiptap-ordered-list {
          list-style-type: decimal;
          list-style-position: outside;
          margin: 0.5em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor [contenteditable] li,
        .rich-text-editor [contenteditable] .tiptap-list-item {
          margin: 0.25em 0;
          display: list-item;
          list-style-position: outside;
        }
        
        .rich-text-editor [contenteditable] strong {
          font-weight: bold;
        }
        
        .rich-text-editor [contenteditable] em {
          font-style: italic;
        }
        
        .rich-text-editor [contenteditable] u {
          text-decoration: underline;
        }
        
        .rich-text-editor [contenteditable] p {
          margin: 0.5em 0;
        }
        
        /* TipTap specific classes */
        .rich-text-editor [contenteditable] .tiptap-heading {
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .rich-text-editor [contenteditable] .tiptap-bullet-list {
          list-style-type: disc;
          list-style-position: outside;
          padding-left: 2em;
        }
        
        .rich-text-editor [contenteditable] .tiptap-list-item {
          display: list-item;
          list-style-position: outside;
          margin: 0.25em 0;
        }
        
        .rich-text-editor [contenteditable] hr,
        .rich-text-editor [contenteditable] .tiptap-horizontal-rule {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5em 0;
          height: 0;
        }
        
        /* Dark mode horizontal rule */
        .dark .rich-text-editor [contenteditable] hr,
        .dark .rich-text-editor [contenteditable] .tiptap-horizontal-rule {
          border-top-color: #4b5563;
        }
        
        .rich-text-editor button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Clean editor styling that matches published pages */
      `}</style>
    </div>
  );
}

export default RichTextEditor; 
