import React, { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { rsvpRepository } from "../../../lib/repositories";
import { toast } from "sonner";

export interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId?: string;
  theme?: "light" | "dark";
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  invitationId,
  theme = "light",
}) => {
  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
  const [formData, setFormData] = useState({
    guest_name: "",
    email: "",
    attending: "YES" as "YES" | "NO" | "MAYBE",
    guests_count: 1,
    message: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationId) {
      toast.error("Error: Missing invitation reference.");
      return;
    }

    setStep("submitting");

    try {
      await rsvpRepository.create({
        invitation_id: invitationId,
        guest_name: formData.guest_name,
        email: formData.email,
        attending: formData.attending,
        guests_count: formData.attending === "NO" ? 0 : formData.guests_count,
        message: formData.message,
      });

      setStep("success");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit RSVP. Please try again.");
      setStep("form");
    }
  };

  const bgClasses =
    theme === "dark"
      ? "bg-[#1C1C1E] text-white border-white/10"
      : "bg-white text-black border-black/10";

  const inputClasses =
    theme === "dark"
      ? "bg-white/5 border-white/10 focus:border-[#DCA963] text-white"
      : "bg-black/5 border-black/10 focus:border-[#DCA963] text-black";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border relative ${bgClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-serif font-bold uppercase tracking-widest mb-2">RSVP</h2>
            <p className={`text-sm mb-8 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Please let us know if you can make it.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className={`w-full p-3 rounded-lg border outline-none transition-all text-sm ${inputClasses}`}
                  placeholder="John & Jane Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-3 rounded-lg border outline-none transition-all text-sm ${inputClasses}`}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                  Will you attend? *
                </label>
                <div className="flex gap-2">
                  {["YES", "NO"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, attending: opt as any })}
                      className={`flex-1 py-3 text-xs font-bold tracking-widest rounded-lg border transition-all ${
                        formData.attending === opt
                          ? "bg-[#DCA963] border-[#DCA963] text-white"
                          : `${theme === "dark" ? "border-white/20 hover:border-white/40" : "border-black/20 hover:border-black/40"}`
                      }`}
                    >
                      {opt === "YES" ? "Joyfully Accept" : "Regretfully Decline"}
                    </button>
                  ))}
                </div>
              </div>

              {formData.attending === "YES" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                    Number of Guests *
                  </label>
                  <select
                    value={formData.guests_count}
                    onChange={(e) =>
                      setFormData({ ...formData, guests_count: parseInt(e.target.value) })
                    }
                    className={`w-full p-3 rounded-lg border outline-none transition-all text-sm ${inputClasses}`}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
                  Message for the Couple
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full p-3 rounded-lg border outline-none transition-all text-sm min-h-[100px] resize-y ${inputClasses}`}
                  placeholder="Any dietary requirements or special notes..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-[#DCA963] text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] hover:bg-[#C99750] transition-colors"
            >
              Send RSVP
            </button>
          </form>
        )}

        {step === "submitting" && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#DCA963] animate-spin mb-4" />
            <h3 className="font-serif text-xl font-bold uppercase tracking-widest">Sending...</h3>
          </div>
        )}

        {step === "success" && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#DCA963]/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#DCA963]" />
            </div>
            <h3 className="font-serif text-2xl font-bold uppercase tracking-widest mb-4">
              Thank You!
            </h3>
            <p className={`text-sm mb-8 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              {formData.attending === "YES"
                ? "We can't wait to celebrate with you!"
                : "We will miss you at the celebration."}
            </p>
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase border transition-colors ${
                theme === "dark"
                  ? "border-white/20 hover:bg-white/10"
                  : "border-black/20 hover:bg-black/5"
              }`}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
