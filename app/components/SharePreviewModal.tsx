"use client";
import React from "react";
import { Share2, Loader2 } from "lucide-react";

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shareText: string;
  isLoading?: boolean;
}

export default function SharePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  shareText,
  isLoading = false,
}: SharePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-black/80 backdrop-blur-md rounded-lg border border-[#23272F] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#23272F] p-4">
          <h3 className="text-lg font-semibold text-white">Preview Share</h3>
          <p className="text-xs text-[#b0b7c3] mt-1">Review before sharing</p>
        </div>

        {/* Preview Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="bg-white/5 rounded-lg p-4 border border-[#23272F] whitespace-pre-wrap text-sm text-[#b0b7c3] font-mono">
            {shareText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#23272F] p-4 flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg border border-[#23272f] text-white hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 width={16} height={16} className="animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 width={16} height={16} />
                Confirm Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
