import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  Monitor,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  UploadCloud,
  Check,
  Loader2,
  Settings,
  Circle,
  CheckCircle2,
  Upload,
  Music,
  Video,
  Play,
  VolumeX,
  Edit3,
  MessageCircle,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth-context";
import { uploadInvitationMedia } from "../../lib/storage";
import {
  TemplateRenderer,
  themeCapabilities,
  ThemeSection,
  TemplateControl,
} from "../../templates/TemplateRegistry";
import { BuilderProvider, EventIcon, AVAILABLE_EVENT_ICONS } from "../../components/builder";
import {
  invitationRepository,
  deploymentRequestRepository,
  generateSlugFromNames,
} from "../../lib/repositories";
import { getByPath, setByPath } from "../../lib/fieldPath";
import { Invitation } from "../../lib/types";
import { normalizeInvitationContent } from "../../lib/migration";
import { canonicalSections } from "../../templates/CanonicalSections";
import { WeddingShareModal } from "../../components/premium/WeddingShareModal";

import { createPortal } from "react-dom";

function IFramePreview({ children, className, width }: { children: React.ReactNode, className: string, width: string }) {
  const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(null);
  const mountNode = contentRef?.contentWindow?.document?.body;

  useEffect(() => {
    if (contentRef && contentRef.contentWindow) {
      const doc = contentRef.contentWindow.document;
      
      const copyStyles = () => {
        // Clear existing to prevent duplicates
        doc.head.innerHTML = '';
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(style => {
          doc.head.appendChild(style.cloneNode(true));
        });
        
        doc.body.className = "bg-white text-black font-sans antialiased overflow-x-hidden";
        doc.body.style.margin = "0";
      };

      copyStyles();
      // Retry in case dynamic styles were injected
      setTimeout(copyStyles, 500);
      setTimeout(copyStyles, 1500);
    }
  }, [contentRef]);

  return (
    <iframe
      ref={setContentRef}
      className={className}
      title="Mobile Preview"
      style={{ border: 'none', backgroundColor: 'white', width: width, height: '100%' }}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}

export const Route = createFileRoute("/client/builder/$slug")({
  component: ClientBuilder,
});

function ClientBuilder() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invitationRecord, setInvitationRecord] = useState<Invitation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewport, setViewport] = useState<"desktop" | "360" | "375" | "390" | "412">("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>("");
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "db_error">("saved");

  const hasHydrated = useRef(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!user) return;
      if (hasHydrated.current) return;
      try {
        const data = await invitationRepository.getBySlug(slug);
        if (!data) throw new Error("Not found in database");
        if (data.client_id !== user.id) {
          throw new Error("Unauthorized");
        }
        
        const migratedContent = normalizeInvitationContent(data.content);
        data.content = migratedContent;

        const localDraft = typeof window !== "undefined" ? localStorage.getItem(`candyinvito:draft:${slug}`) : null;
        if (localDraft) {
          try {
            const parsed = JSON.parse(localDraft);
            const restore = typeof window !== "undefined" && window.confirm("Unsaved local changes found from a previous session. Restore them?");
            if (restore) {
              data.content = parsed;
              setSaveStatus("unsaved");
            } else {
              localStorage.removeItem(`candyinvito:draft:${slug}`);
            }
          } catch (e) {
            localStorage.removeItem(`candyinvito:draft:${slug}`);
          }
        }

        setInvitationRecord(data);
        setEditedTitle(data.couple_names || data.title || "Wedding Invitation");
        hasHydrated.current = true;
      } catch (err) {
        console.error("Error loading invitation:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvitation();
  }, [slug, user]);

  // BeforeUnload Protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const saveRevision = useRef(0);

  // Local Storage Safety Backup
  useEffect(() => {
    if (saveStatus === "unsaved" && invitationRecord) {
      localStorage.setItem(`candyinvito:draft:${slug}`, JSON.stringify(invitationRecord.content));
    }
  }, [invitationRecord, saveStatus, slug]);

  const saveToDb = useCallback(async (recordToSave: Invitation) => {
    if (!recordToSave) return;
    const currentRevision = ++saveRevision.current;
    
    // Auto-extract couple names from content if present
    const p1 = recordToSave.content?.couple?.partner1 || recordToSave.content?.hero?.groomName || "";
    const p2 = recordToSave.content?.couple?.partner2 || recordToSave.content?.hero?.partner2 || "";
    let extractedNames = recordToSave.couple_names;
    if (p1 && p2) {
      extractedNames = `${p1} & ${p2}`;
    } else if (p1) {
      extractedNames = p1;
    } else if (recordToSave.content?.hero?.title) {
      extractedNames = recordToSave.content.hero.title;
    }

    try {
      setSaveStatus("saving");
      await invitationRepository.update(recordToSave.id, {
        content: recordToSave.content,
        template_id: recordToSave.template_id,
        couple_names: extractedNames,
        title: extractedNames,
      });
      
      if (saveRevision.current === currentRevision) {
        setSaveStatus("saved");
        localStorage.removeItem(`candyinvito:draft:${slug}`);
      }
    } catch (err: any) {
      if (saveRevision.current === currentRevision) {
        console.error(err);
        setSaveStatus(err?.message?.includes("column") || err?.message?.includes("PGRST204") || err?.code === "PGRST204" ? "db_error" : "unsaved");
        toast.error(err?.message || "Failed to save changes.");
      }
    }
  }, [slug]);

  const updateData = useCallback((path: string, value: any) => {
    setInvitationRecord((prev) => {
      if (!prev) return prev;
      const newContent = setByPath(prev.content || {}, path, value);
      const nextRecord = { ...prev, content: newContent };
      setSaveStatus("unsaved");
      return nextRecord;
    });
  }, []);

  const addArrayItem = (arrayPath: string, templateObject: any = {}) => {
    setInvitationRecord((prev) => {
      if (!prev) return prev;
      const currentArr = getByPath(prev.content, arrayPath) || [];
      const newItem = { id: crypto.randomUUID(), ...templateObject };
      const newContent = setByPath(prev.content, arrayPath, [...currentArr, newItem]);
      const nextRecord = { ...prev, content: newContent };
      setSaveStatus("unsaved");
      return nextRecord;
    });
  };

  const removeArrayItem = (arrayPath: string, index: number) => {
    setInvitationRecord((prev) => {
      if (!prev) return prev;
      const currentArr = [...(getByPath(prev.content, arrayPath) || [])];
      currentArr.splice(index, 1);
      const newContent = setByPath(prev.content, arrayPath, currentArr);
      const nextRecord = { ...prev, content: newContent };
      setSaveStatus("unsaved");
      return nextRecord;
    });
  };

  const toggleSection = (section: any) => {
    if (!invitationRecord) return;
    const isEnabled = isSectionEnabled(section);
    
    setInvitationRecord((prev) => {
      if (!prev) return prev;
      let newContent = { ...prev.content };
      
      if (section.isArray && section.arrayPath) {
        if (isEnabled) {
          newContent = setByPath(newContent, section.arrayPath, []); // Clear array
          if (section.enablePath) {
            newContent = setByPath(newContent, section.enablePath, false);
          }
        } else {
          const currentArr = getByPath(newContent, section.arrayPath) || [];
          const newItem = { id: crypto.randomUUID(), ...(section.defaultItem || {}) };
          newContent = setByPath(newContent, section.arrayPath, [...currentArr, newItem]); // Add first item
          if (section.enablePath) {
            newContent = setByPath(newContent, section.enablePath, true);
          }
        }
      } else if (section.enablePath) {
        newContent = setByPath(newContent, section.enablePath, !isEnabled);
      }

      setSaveStatus("unsaved");
      return { ...prev, content: newContent };
    });
  };

  const isSectionEnabled = (section: any) => {
    if (!invitationRecord) return false;
    if (section.enablePath) {
      if (!getByPath(invitationRecord.content, section.enablePath)) {
        return false;
      }
    }
    if (section.isArray && section.arrayPath) {
      const arr = getByPath(invitationRecord.content, section.arrayPath) as any[];
      return arr && arr.length > 0;
    }
    return true;
  };

  const handleExpandSection = (sectionId: string) => {
    const newSection = expandedSection === sectionId ? "" : sectionId;
    setExpandedSection(newSection);
    
    if (newSection) {
      // Delay slightly to allow the DOM to render if the section was just enabled
      setTimeout(() => {
        const el = document.getElementById(newSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  if (saveStatus === "db_error") {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-xl max-w-xl w-full shadow-2xl">
          <h2 className="text-2xl font-serif text-red-600 mb-4">Database Migration Required</h2>
          <p className="text-black/70 mb-4">Your Supabase database is missing the required <strong>content</strong> column. The editor cannot save your changes.</p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto mb-6 text-black/80">
            ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{{}}'::jsonb;<br/>
          </div>
          <p className="text-sm font-semibold mb-4">Please run this exact query in your Supabase SQL Editor and refresh this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DCA963]"></div></div>;
  }

  if (!invitationRecord) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">Invitation not found</div>;
  }

  const currentThemeId = invitationRecord.template_id || "default";
  const themeSchema = themeCapabilities[currentThemeId] || Object.values(themeCapabilities)[0];

  const handlePublish = async () => {
    if (!invitationRecord || !user) return;
    try {
      setSaveStatus("saving");
      await saveToDb({
        ...invitationRecord,
        status: "Published",
      } as any);
      await deploymentRequestRepository.request(invitationRecord.id, user.id);
      await invitationRepository.update(invitationRecord.id, { status: "Published" });
      setSaveStatus("saved");
      toast.success("Deployment Request Submitted!", { 
        description: "Your invitation is published and submitted to the admin for custom hosting.",
        duration: 5000 
      });
    } catch (err: any) {
      if (err.message?.includes("already pending")) {
        toast.info("A deployment request is already pending review with the admin.");
        setSaveStatus("saved");
      } else if (err.message?.includes('violates row-level security')) {
        toast.error("Your database doesn't have the deployment_requests table or policies set up.");
        setSaveStatus("unsaved");
      } else {
        toast.error(err?.message || "Failed to submit deployment request.");
        setSaveStatus("unsaved");
      }
    }
  };

  const renderControl = (control: TemplateControl, activePath: string) => {
    const val = getByPath(invitationRecord.content, activePath) || "";
    const isMedia =
      control.type === "url" ||
      activePath.toLowerCase().includes("audio") ||
      activePath.toLowerCase().includes("video") ||
      control.label.toLowerCase().includes("audio") ||
      control.label.toLowerCase().includes("video") ||
      control.label.toLowerCase().includes("music");

    if (isMedia) {
      return (
        <MediaFieldControl
          key={activePath}
          label={control.label}
          value={val}
          activePath={activePath}
          updateData={updateData}
          invitationId={invitationRecord.id}
          userId={user?.id || "anonymous"}
        />
      );
    }

    if (control.type === "text") {
      return (
        <div key={activePath} className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">{control.label}</label>
          <input
            type="text"
            value={val}
            onChange={(e) => updateData(activePath, e.target.value)}
            className="w-full bg-[#F3F4F6] border border-black/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#DCA963]"
          />
        </div>
      );
    }

    if (control.type === "select") {
      return (
        <div key={activePath} className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">{control.label}</label>
          <select
            value={val}
            onChange={(e) => updateData(activePath, e.target.value)}
            className="w-full bg-[#F3F4F6] border border-black/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#DCA963]"
          >
            <option value="">Select...</option>
            {control.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }
    
    return null;
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="h-16 bg-white/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-[100]">
          <button onClick={() => setIsPreviewMode(false)} className="text-white hover:text-[#DCA963] flex items-center gap-2 text-sm font-semibold transition-colors">
            <ArrowLeft size={16} /> Exit Preview
          </button>
          <button onClick={handlePublish} className="bg-[#DCA963] hover:bg-[#C59652] text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
            Publish
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <BuilderProvider isBuilderMode={false} activeSection="" setActiveSection={()=>{}} updateData={()=>{}} data={invitationRecord.content} userId={user?.id}>
            <TemplateRenderer templateId={currentThemeId} data={invitationRecord.content} invitationId={invitationRecord.id} />
          </BuilderProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F3F4F6] flex flex-col overflow-hidden font-sans">
      {/* HEADER */}
      <div className="h-16 bg-white border-b border-black/10 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 text-black/70 hover:text-black rounded-xl hover:bg-black/5 transition-colors"
            title="Toggle Sections"
          >
            <Settings size={18} />
          </button>

          <Link to="/client" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="CandyInvito"
              className="w-8 h-8 rounded-full object-cover border border-[#DCA963]/30"
            />
            <div className="hidden sm:block">
              <span className="font-serif font-bold text-sm tracking-tight text-[#201814] block leading-none">
                CandyInvito
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#DCA963] font-bold block mt-0.5">
                Studio Builder
              </span>
            </div>
          </Link>

          <div className="hidden lg:block h-4 w-px bg-black/10 mx-1"></div>

          {/* Editable Invitation Name */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-black/5 rounded-xl border border-black/5">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xs font-serif font-bold text-[#201814] bg-white border border-[#DCA963] rounded-lg px-2 py-0.5 outline-none max-w-[180px]"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsEditingTitle(false);
                    if (editedTitle.trim()) {
                      setInvitationRecord((prev) =>
                        prev
                          ? {
                              ...prev,
                              couple_names: editedTitle.trim(),
                              title: editedTitle.trim(),
                            }
                          : prev,
                      );
                      setSaveStatus("unsaved");
                    }
                  }}
                  className="text-[10px] bg-[#141210] text-white px-2 py-0.5 rounded font-bold uppercase"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#201814] hover:text-[#DCA963] transition-colors"
                title="Click to rename wedding invitation"
              >
                <span>{invitationRecord?.couple_names || invitationRecord?.title || "Wedding Invitation"}</span>
                <Edit3 size={12} className="text-black/40" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-black/50">
            {saveStatus === "saving" ? (
              <Loader2 size={12} className="animate-spin text-[#DCA963]" />
            ) : (
              <Check size={12} className="text-emerald-600" />
            )}
            <span className="text-[11px]">
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "unsaved"
                  ? "Unsaved"
                  : "Saved"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => saveToDb(invitationRecord as any)}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#141210] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#DCA963] hover:text-[#141210] transition-all disabled:opacity-50 shadow-2xs"
          >
            <Save size={13} />
            <span className="hidden xs:inline">
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save"}
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowThemeSwitcher(!showThemeSwitcher)}
              className="hidden sm:flex items-center gap-1.5 border border-[#DCA963]/40 bg-[#DCA963]/10 hover:bg-[#DCA963]/20 text-[#141210] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            >
              <LayoutTemplate size={13} />
              <span className="truncate max-w-[100px]">{themeSchema.name}</span>
              <ChevronDown size={13} />
            </button>
            {showThemeSwitcher && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden z-50 p-1.5">
                {Object.values(themeCapabilities).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setInvitationRecord((prev) =>
                        prev ? { ...prev, template_id: theme.id } : prev,
                      );
                      setSaveStatus("unsaved");
                      setShowThemeSwitcher(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-black/5 flex items-center justify-between ${
                      invitationRecord?.template_id === theme.id
                        ? "font-bold bg-[#FAF9F6] text-[#DCA963]"
                        : "text-black/80"
                    }`}
                  >
                    <span>{theme.name}</span>
                    {theme.id === currentThemeId && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="hidden sm:flex items-center gap-1.5 bg-[#DCA963]/15 hover:bg-[#DCA963] hover:text-[#141210] text-[#201814] border border-[#DCA963]/30 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            title="Preview and share WhatsApp invitation announcement"
          >
            <MessageCircle size={13} /> <span className="hidden lg:inline">Share Text</span>
          </button>

          <button
            onClick={() => setIsPreviewMode(true)}
            className="flex items-center gap-1.5 bg-white border border-black/10 hover:bg-black/5 text-[#201814] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Eye size={13} /> <span className="hidden xs:inline">Preview</span>
          </button>

          <button
            onClick={handlePublish}
            className="bg-[#DCA963] hover:bg-[#C99750] text-[#141210] font-bold px-4 sm:px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* MOBILE BACKDROP FOR DRAWER */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR - STRUCTURAL CONTROLS */}
        <div
          className={`w-[300px] sm:w-[320px] shrink-0 bg-white border-r border-black/10 overflow-y-auto flex flex-col shadow-sm z-30 transition-transform duration-300 ${
            isMobileSidebarOpen
              ? "fixed inset-y-0 left-0 top-16 translate-x-0"
              : "hidden md:flex"
          }`}
        >
          <div className="p-4 border-b border-black/5 bg-[#FAF9F6] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#201814]">
                Sections & Layout
              </h2>
              <p className="text-[10px] text-black/50 leading-relaxed mt-0.5">
                Toggle and customize sections.
              </p>
            </div>
            {isMobileSidebarOpen && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden p-1 text-black/50 hover:text-black rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {canonicalSections.map((section) => {
              const enabled = isSectionEnabled(section);
              return (
                <div key={section.id} className={`border ${enabled ? 'border-black/10 bg-white' : 'border-dashed border-black/10 bg-black/5 opacity-70'} rounded-lg overflow-hidden transition-all`}>
                  
                  <div className="flex items-center justify-between p-3">
                    <button 
                      onClick={() => handleExpandSection(section.id)}
                      className="flex-1 flex items-center gap-3 text-sm font-semibold text-left"
                    >
                      {enabled ? <CheckCircle2 size={16} className="text-[#DCA963]" /> : <Circle size={16} className="text-black/30" />}
                      <span className="uppercase text-[10px] tracking-widest font-bold">{section.label}</span>
                    </button>
                    
                    {/* Enable/Disable Toggle for Optional Sections */}
                    {(section.enablePath || section.isArray) && (
                      <button 
                        onClick={() => toggleSection(section)}
                        className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${enabled ? 'text-red-500 hover:bg-red-50' : 'text-[#DCA963] hover:bg-[#DCA963]/10'}`}
                      >
                        {enabled ? (section.isArray ? 'Clear' : 'Remove') : 'Add'}
                      </button>
                    )}
                  </div>

                  {/* Expanded Controls Panel */}
                  {expandedSection === section.id && enabled && (
                    <div className="p-4 bg-[#F8F9FA] border-t border-black/5">
                      
                      {/* Array Items Management */}
                      {section.isArray && (
                        <div className="mb-4 space-y-2">
                          {((getByPath(invitationRecord.content, section.arrayPath!) as any[]) || []).map((item, index) => {
                            const itemTitle = item.title || item.year || `Item ${index + 1}`;
                            return (
                              <div key={index} className="p-2.5 bg-white border border-black/5 rounded-lg shadow-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#201814] truncate max-w-[160px]">
                                    {itemTitle}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => removeArrayItem(section.arrayPath!, index)}
                                      className="p-1 text-black/40 hover:text-red-500 rounded transition-colors"
                                      title="Delete Item"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {section.id === "events" && (
                                  <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                                      <EventIcon name={item.icon || "sparkles"} className="w-3.5 h-3.5 text-[#DCA963]" />
                                      Icon
                                    </label>
                                    <select
                                      value={item.icon || "sparkles"}
                                      onChange={(e) => updateData(`events[${index}].icon`, e.target.value)}
                                      className="bg-[#F3F4F6] border border-black/10 rounded px-2 py-1 text-xs outline-none focus:border-[#DCA963] cursor-pointer"
                                    >
                                      {AVAILABLE_EVENT_ICONS.map((ico) => (
                                        <option key={ico.value} value={ico.value}>
                                          {ico.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <button
                            onClick={() => addArrayItem(section.arrayPath!, section.defaultItem || {})}
                            className="w-full mt-2 py-2 border border-dashed border-[#DCA963]/50 text-[#DCA963] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#DCA963]/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={14} /> Add Item
                          </button>
                        </div>
                      )}

                      {/* Non-array Advanced Controls */}
                      {!section.isArray && section.controls.length > 0 && (
                        <div className="space-y-4">
                          {section.controls.map((control) => renderControl(control, control.id))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* VISUAL CANVAS PREVIEW */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#E5E7EB]">
          {/* Device Toggles */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center bg-white shadow-md rounded-full p-1 border border-black/5 z-20">
            <button onClick={() => setViewport("desktop")} className={`flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-full transition-all ${viewport === "desktop" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}>
              <Monitor size={14} /> Desktop
            </button>
            <div className="h-4 w-px bg-black/10 mx-1"></div>
            <button onClick={() => setViewport("360")} className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all ${viewport === "360" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}>
              <Smartphone size={14} /> 360
            </button>
            <button onClick={() => setViewport("375")} className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all ${viewport === "375" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}>
              375
            </button>
            <button onClick={() => setViewport("390")} className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all ${viewport === "390" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}>
              390
            </button>
            <button onClick={() => setViewport("412")} className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all ${viewport === "412" ? "bg-black text-white" : "text-black/60 hover:text-black"}`}>
              412
            </button>
          </div>

          {/* Flexible Canvas Container */}
          <div className="flex-1 overflow-y-auto flex justify-center items-start pt-24 pb-20 px-4 md:px-8">
             <div 
                className={`transition-all duration-500 ease-in-out relative origin-top ${
                  viewport !== "desktop" ? "rounded-[40px] border-[12px] border-[#1C1C1E] bg-black h-[812px] overflow-hidden shadow-2xl shrink-0" : "bg-white shadow-2xl overflow-x-hidden rounded-lg w-full max-w-5xl min-h-full"
                }`}
                style={{ width: viewport !== "desktop" ? `${parseInt(viewport) + 24}px` : undefined }}
             >
               {viewport !== "desktop" ? (
                 <IFramePreview className="w-full h-full bg-white" width={`${viewport}px`}>
                   <BuilderProvider isBuilderMode={true} activeSection={expandedSection} setActiveSection={setExpandedSection} updateData={updateData} data={invitationRecord.content} invitationId={invitationRecord.id} userId={user?.id}>
                     <TemplateRenderer
                        templateId={currentThemeId}
                        data={invitationRecord.content}
                        invitationId={invitationRecord.id}
                     />
                   </BuilderProvider>
                 </IFramePreview>
               ) : (
                 <BuilderProvider isBuilderMode={true} activeSection={expandedSection} setActiveSection={setExpandedSection} updateData={updateData} data={invitationRecord.content} invitationId={invitationRecord.id} userId={user?.id}>
                   <TemplateRenderer
                      templateId={currentThemeId}
                      data={invitationRecord.content}
                      invitationId={invitationRecord.id}
                   />
                 </BuilderProvider>
               )}
             </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <WeddingShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          invitation={invitationRecord}
        />
      )}
    </div>
  );
}

function MediaFieldControl({
  label,
  value,
  activePath,
  updateData,
  invitationId,
  userId,
}: {
  label: string;
  value: string;
  activePath: string;
  updateData: (path: string, val: any) => void;
  invitationId: string;
  userId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAudio =
    activePath.toLowerCase().includes("audio") ||
    label.toLowerCase().includes("audio") ||
    label.toLowerCase().includes("music");
  const isVideo =
    activePath.toLowerCase().includes("video") || label.toLowerCase().includes("video");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const slotId = activePath.replace(/[^a-zA-Z0-9-]/g, "-");
      const mediaUrl = await uploadInvitationMedia(userId, invitationId, slotId, file);
      updateData(activePath, mediaUrl);
      toast.success(`${isAudio ? "Audio" : isVideo ? "Video" : "Media"} uploaded successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload media");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleAudioTest = () => {
    if (!value) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(value);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = value;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => toast.error("Could not play audio: " + e.message));
    }
  };

  return (
    <div key={activePath} className="mb-5 bg-[#F9F8F6] p-3.5 rounded-xl border border-black/5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#201814]/70 flex items-center gap-1.5">
          {isAudio ? (
            <Music size={12} className="text-[#DCA963]" />
          ) : isVideo ? (
            <Video size={12} className="text-[#DCA963]" />
          ) : null}
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => updateData(activePath, "")}
            className="text-[10px] text-rose-500 hover:underline font-bold uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      {/* Upload Local File or Enter URL */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileRef}
            accept={
              isAudio
                ? "audio/mp3,audio/mpeg,audio/wav,audio/aac,audio/m4a,audio/ogg,.mp3,.wav,.m4a,.aac"
                : isVideo
                  ? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  : "image/*,video/*,audio/*"
            }
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-[#201814] hover:text-white border border-black/10 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 size={13} className="animate-spin text-[#DCA963]" />
            ) : (
              <Upload size={13} className="text-[#DCA963]" />
            )}
            {isUploading
              ? "Uploading..."
              : `Upload ${isAudio ? "Audio (MP3)" : isVideo ? "Video (MP4)" : "File"}`}
          </button>

          {isAudio && value && (
            <button
              type="button"
              onClick={toggleAudioTest}
              className="px-3 py-2 bg-[#201814] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#382B23]"
              title="Test audio playback"
            >
              {isPlaying ? <VolumeX size={13} /> : <Play size={13} />}
              {isPlaying ? "Stop" : "Test"}
            </button>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder={
              isAudio
                ? "Or paste direct MP3/Audio URL..."
                : isVideo
                  ? "Or paste direct MP4/Video URL..."
                  : "Or paste URL..."
            }
            value={value}
            onChange={(e) => updateData(activePath, e.target.value)}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-black focus:outline-none focus:border-[#DCA963]"
          />
        </div>
      </div>
    </div>
  );
}
