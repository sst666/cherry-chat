import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Image, FileText, X } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { usePdf } from '../hooks/usePdf';

export default function InputArea() {
  const { state, dispatch, sendMessage } = useChatContext();
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { pdfToImages } = usePdf();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [text]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    if (state.isLoading) return;

    if (!state.currentConvId) {
      dispatch({ type: 'NEW_CONVERSATION' });
    }

    setText('');
    const imgs = [...images];
    setImages([]);
    await sendMessage(trimmed, imgs.length > 0 ? imgs : undefined);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function processImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const results = await Promise.all(
      arr
        .filter((f) => f.type.startsWith('image/'))
        .map(processImageFile)
    );
    setImages((prev) => [...prev, ...results]);
  }

  async function handlePdfFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter(
      (f) => f.type === 'application/pdf'
    );
    for (const file of arr) {
      const pages = await pdfToImages(file);
      setImages((prev) => [...prev, ...pages]);
    }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      const images = Array.from(files).filter((f) =>
        f.type.startsWith('image/')
      );
      const pdfs = Array.from(files).filter(
        (f) => f.type === 'application/pdf'
      );
      if (images.length) await handleImageFiles(images);
      if (pdfs.length) await handlePdfFiles(pdfs);
    },
    []
  );

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div
        className={`border rounded-2xl bg-white transition-all ${
          isDragging
            ? 'border-[#4f46e5] shadow-lg shadow-[#4f46e5]/10'
            : 'border-[#e5e7eb] hover:border-[#d1d5db]'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`preview-${i}`}
                  className="w-16 h-16 object-cover rounded-lg border border-[#e5e7eb]"
                />
                <button
                  onClick={() =>
                    setImages((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#ef4444] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message CherryChat… (Shift+Enter for newline)"
          rows={1}
          className="w-full px-4 py-3 text-sm text-[#111827] placeholder-[#9ca3af] bg-transparent outline-none"
          style={{ minHeight: 44, maxHeight: 200 }}
          disabled={state.isLoading}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            {/* Image upload */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleImageFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 text-[#6b7280] hover:text-[#4f46e5] hover:bg-[#f5f3ff] rounded-lg transition-colors"
              title="Attach image"
            >
              <Image size={16} />
            </button>

            {/* PDF upload */}
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handlePdfFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="p-1.5 text-[#6b7280] hover:text-[#4f46e5] hover:bg-[#f5f3ff] rounded-lg transition-colors"
              title="Attach PDF"
            >
              <FileText size={16} />
            </button>
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={
              state.isLoading ||
              (!text.trim() && images.length === 0)
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#4f46e5' }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.background = '#4338ca';
            }}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = '#4f46e5')
            }
          >
            <Send size={14} />
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-[#9ca3af] mt-1.5">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
