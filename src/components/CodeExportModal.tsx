import { useState, useEffect } from 'react';
import { Copy, Check, ArrowDownToLine, X, AlertCircle, Link } from 'lucide-react';
import { decodeSkillTemplate } from '../core/codec/templateCodec';
import { resolveTemplateSkills } from '../data/skills';
import { TemplateData, Gw1Skill } from '../data/types';

interface CodeExportModalProps {
  isOpen: boolean;
  templateCode: string;
  onClose: () => void;
  onImportBuild: (data: {
    templateData: TemplateData;
    skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  }) => void;
}

export function CodeExportModal({
  isOpen,
  templateCode,
  onClose,
  onImportBuild,
}: CodeExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(templateCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}#${templateCode}`;
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleImport = () => {
    setImportError(null);
    if (!importInput.trim()) {
      setImportError('Please paste a template code to import.');
      return;
    }

    try {
      const decoded = decodeSkillTemplate(importInput.trim());
      const resolvedSkills = resolveTemplateSkills(decoded.skills) as [
        Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill
      ];

      onImportBuild({
        templateData: decoded,
        skills: resolvedSkills,
      });

      setImportInput('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid Guild Wars 1 template code.';
      setImportError(msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-5 text-stone-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close template modal"
          className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="modal-title" className="text-lg font-bold text-amber-500 mb-1">
          In-Game Template Code
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Export your generated build code directly to Guild Wars 1, or import a code from your game client.
        </p>

        {/* Export Box */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Current Build Code
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={templateCode}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-2.5 font-mono text-sm text-amber-400 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy direct link to build"
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all ${
                linkCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
              }`}
            >
              {linkCopied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
              {linkCopied ? 'Link Copied' : 'Share Link'}
            </button>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5">
            Tip: In Guild Wars, open Skills (K) → Skills & Attributes template menu → Load from Template Code.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-800 my-4" />

        {/* Import Box */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Import Build Code
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Paste template code e.g. OwFj0xfzITOMMMHMie4O0kxZ6PA..."
              value={importInput}
              onChange={e => setImportInput(e.target.value)}
              className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-2.5 font-mono text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleImport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Import
            </button>
          </div>

          {importError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
