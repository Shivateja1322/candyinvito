import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Sparkles,
  Copy,
  MessageCircle,
  Mail,
  ExternalLink,
  Edit3,
  Check,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  WeddingShareDetails,
  formatWeddingShareMessage,
  extractWeddingShareDetails,
} from "../../lib/weddingShare";

interface WeddingShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: any;
}

export const WeddingShareModal: React.FC<WeddingShareModalProps> = ({
  isOpen,
  onClose,
  invitation,
}) => {
  if (!invitation) return null;

  const initialDetails = extractWeddingShareDetails(invitation);
  const [details, setDetails] = useState<WeddingShareDetails>(initialDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const formattedMessage = formatWeddingShareMessage(details);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formattedMessage);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = formattedMessage;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setHasCopied(true);
      toast.success("Wedding invitation message copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2500);
    } catch (err) {
      toast.error("Failed to copy text.");
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(formattedMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      `💍 Wedding Invitation: ${details.coupleNames || "Celebrate With Us"}`,
    );
    const body = encodeURIComponent(formattedMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Wedding Invitation — ${details.coupleNames}`,
          text: formattedMessage,
          url: details.invitationUrl,
        });
      } catch (e) {}
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-[#FAF9F6] border border-black/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#201814] font-sans">
        <DialogHeader className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCA963]/15 text-[#DCA963] text-[10px] font-bold uppercase tracking-widest border border-[#DCA963]/30 w-fit">
            <Sparkles size={11} /> Guest Invitation Announcement
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#201814]">
            Share Your Wedding Invitation
          </DialogTitle>
          <DialogDescription className="text-xs text-black/60">
            Formatted with couple names, schedule, venue, live link, and Google Maps for easy WhatsApp and SMS sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          {/* Action to Toggle Detail Editing */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-black/50">
              {isEditing ? "Customizing Announcement Fields" : "Formatted Announcement Preview"}
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-[#DCA963] hover:text-[#201814] flex items-center gap-1 uppercase tracking-wider transition-colors"
            >
              <Edit3 size={13} /> {isEditing ? "Done Editing" : "Edit Details"}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-black/10 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-black/50 mb-1 text-[10px]">
                  Couple Names
                </label>
                <input
                  type="text"
                  value={details.coupleNames}
                  onChange={(e) => setDetails({ ...details, coupleNames: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-2.5 outline-none focus:border-[#DCA963]"
                  placeholder="e.g. Akhila ❤️ Naveen"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-black/50 mb-1 text-[10px]">
                    Wedding Date
                  </label>
                  <input
                    type="text"
                    value={details.weddingDate || ""}
                    onChange={(e) => setDetails({ ...details, weddingDate: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-2.5 outline-none focus:border-[#DCA963]"
                    placeholder="e.g. 9 July 2026 (Thursday)"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-black/50 mb-1 text-[10px]">
                    Wedding Time
                  </label>
                  <input
                    type="text"
                    value={details.weddingTime || ""}
                    onChange={(e) => setDetails({ ...details, weddingTime: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-2.5 outline-none focus:border-[#DCA963]"
                    placeholder="e.g. 11:20 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-black/50 mb-1 text-[10px]">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={details.venueName || ""}
                  onChange={(e) => setDetails({ ...details, venueName: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-2.5 outline-none focus:border-[#DCA963]"
                  placeholder="e.g. SVR Gardens, Karimnagar"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-black/50 mb-1 text-[10px]">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={details.mapsUrl || ""}
                  onChange={(e) => setDetails({ ...details, mapsUrl: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-2.5 outline-none focus:border-[#DCA963]"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          ) : (
            /* Live Formatted Card */
            <div className="bg-white border border-[#DCA963]/30 rounded-2xl p-5 shadow-xs relative">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#201814] leading-relaxed select-text">
                {formattedMessage}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Close
          </Button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              onClick={copyToClipboard}
              className="bg-[#141210] hover:bg-[#2A231F] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              {hasCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {hasCopied ? "Copied!" : "Copy Text"}
            </Button>

            <Button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle size={14} /> WhatsApp
            </Button>

            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white border-black/10"
            >
              <Mail size={14} /> Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
