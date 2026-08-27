import React from "react";
import { useBuilder } from "./BuilderContext";
import { Settings, ArrowUp, ArrowDown, Copy, EyeOff, Trash2 } from "lucide-react";

type EditableSectionProps = {
  id: string;
  className?: string;
  children: React.ReactNode;
};

export const EditableSection: React.FC<EditableSectionProps> = ({
  id,
  className = "",
  children,
}) => {
  const { isBuilderMode, activeSection, setActiveSection } = useBuilder();

  if (!isBuilderMode) {
    return <section className={className}>{children}</section>;
  }

  const isActive = activeSection === id;

  return (
    <section
      onClick={(e) => {
        // e.stopPropagation();
        setActiveSection(id);
      }}
      className={`relative transition-all cursor-pointer ${className} ${
        isActive
          ? "ring-2 ring-[#DCA963] ring-inset"
          : "hover:ring-1 hover:ring-[#DCA963]/30 hover:ring-inset"
      }`}
    >
      {isActive && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-xl border border-black/5 flex items-center p-1 z-50 animate-fade-in">
          <button
            className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-md transition-colors"
            title="Edit Properties"
          >
            <Settings size={14} />
          </button>
          <div className="w-[1px] h-4 bg-black/10 mx-1" />
          <button
            className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-md transition-colors"
            title="Move Up"
          >
            <ArrowUp size={14} />
          </button>
          <button
            className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-md transition-colors"
            title="Move Down"
          >
            <ArrowDown size={14} />
          </button>
          <div className="w-[1px] h-4 bg-black/10 mx-1" />
          <button
            className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-md transition-colors"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-md transition-colors"
            title="Hide Section"
          >
            <EyeOff size={14} />
          </button>
          <div className="w-[1px] h-4 bg-black/10 mx-1" />
          <button
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Content wrapper with pointer-events-none if active? No, we need to click text inside */}
      <div className="relative z-0">{children}</div>
    </section>
  );
};
