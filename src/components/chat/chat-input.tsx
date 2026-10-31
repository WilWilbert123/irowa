// src/components/chat/chat-input.tsx
"use client";

import React, { useState } from "react";
import { SendHorizontal, User } from "lucide-react";
import { useVisitor } from "@/contexts/visitor-context";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const { visitor, setDisplayName } = useVisitor();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasName = Boolean(visitor?.displayName && visitor.displayName.trim().length >= 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!hasName) {
      setNamePromptOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await onSendMessage(text.trim());
      if (res.success) {
        setText("");
      } else {
        setErrorMsg(res.error || "Failed to deliver message");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim().length >= 2) {
      setDisplayName(tempName.trim());
      setNamePromptOpen(false);
      // Proceed with submit
      if (text.trim()) {
        onSendMessage(text.trim()).then((res) => {
          if (res.success) setText("");
        });
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        {errorMsg && (
          <div className="mb-2 text-xs text-rose-600 dark:text-rose-400 font-medium px-2">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-700/60 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isSubmitting}
            placeholder={hasName ? `Message as ${visitor?.displayName}...` : "Type your message..."}
            maxLength={1000}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!text.trim() || disabled || isSubmitting}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all duration-150 ease-out shadow-xs cursor-pointer select-none"
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-slate-400">
          <span>{hasName ? `Posting as ${visitor?.displayName}` : "Public Community Chat"}</span>
          <span>{text.length}/1000</span>
        </div>
      </form>

      {/* Display Name Requirement Modal */}
      <Dialog open={namePromptOpen} onOpenChange={setNamePromptOpen}>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3">
            <User className="h-6 w-6" />
          </div>
          <DialogTitle>Enter Your Display Name</DialogTitle>
          <DialogDescription>
            To keep public water discussions respectful and helpful, please provide a display name before sending messages.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveName} className="space-y-4 mt-2">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="e.g. Maria S., Juan B."
            autoFocus
            maxLength={40}
            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNamePromptOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={tempName.trim().length < 2}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
            >
              Continue to Chat
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
