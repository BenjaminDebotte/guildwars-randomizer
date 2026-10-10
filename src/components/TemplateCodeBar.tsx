import { useState, useEffect, useRef } from 'react';
import { Copy, Check, ClipboardPaste, Link, ArrowDownToLine, AlertCircle } from 'lucide-react';

interface TemplateCodeBarProps {
  templateCode: string;
  onApplyCode: (code: string) => boolean;
  onOpenModal: () => void;
}

export function TemplateCodeBar({
  templateCode,
  onApplyCode,
  onOpenModal,
}: TemplateCodeBarProps) {
  const [inputValue, setInputValue] = useState(templateCode);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input in sync with generated build
  useEffect(() => {
    setInputValue(templateCode);
    setErrorMessage(null);
  }, [templateCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(templateCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}#${templateCode}`;
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApply = (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) return;
    if (trimmed === templateCode) {
      setErrorMessage(null);
      return;
    }

    const success = onApplyCode(trimmed);
    if (!success) {
      setErrorMessage('Invalid template code format.');
    } else {
      setErrorMessage(null);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputValue(text.trim());
        handleApply(text);
      }
    } catch {
      // If clipboard permission is not granted, focus input for user Ctrl+V
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply(inputValue);
    }
  };

  const isDifferent = inputValue.trim() !== '' && inputValue.trim() !== templateCode;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#16171d] border border-stone-800 rounded-xl p-3.5 sm:p-4 text-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            Build Template Code
          </span>
          <span className="text-[10px] text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
            Ctrl+V in GW1 client
          </span>
        </div>

        <span className="text-[11px] text-stone-400 hidden sm:inline">
          Paste any GW1 code to immediately load build
        </span>
      </div>

      {/* Code Input & Primary Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Monospace Code Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id="template-code-input"
            aria-label="Build template code"
            type="text"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setErrorMessage(null);
            }}
            onKeyDown={handleKeyDown}
            onPaste={e => {
              const pasted = e.clipboardData.getData('text');
              if (pasted) {
                e.preventDefault();
                const trimmed = pasted.trim();
                setInputValue(trimmed);
                handleApply(trimmed);
              }
            }}
            placeholder="Paste template code here..."
            className="w-full bg-[#0f1014] border border-stone-700/80 hover:border-stone-600 focus:border-amber-500 rounded-lg px-3 py-2 font-mono text-xs sm:text-sm text-amber-300 font-semibold focus:outline-none transition-colors"
          />
        </div>

        {/* Action Buttons Strip */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Apply button if input has been modified */}
          {isDifferent && (
            <button
              type="button"
              onClick={() => handleApply(inputValue)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors cursor-pointer"
            >
              Apply Code
            </button>
          )}

          {/* Quick Paste Button */}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            title="Paste code from clipboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline">Paste</span>
          </button>

          {/* Copy Code Button (Primary) */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy template code to clipboard"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {/* Share Link */}
          <button
            type="button"
            onClick={handleShareLink}
            title="Copy shareable link"
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer border ${
              linkCopied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
          >
            {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
          </button>

          {/* Import / Export dialog trigger */}
          <button
            type="button"
            onClick={onOpenModal}
            title="Import/Export options"
            className="p-2 rounded-lg text-xs bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
