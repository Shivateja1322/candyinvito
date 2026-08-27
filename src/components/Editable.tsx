import React, { useState, useEffect, useRef } from "react";

export type EditorMode = "editor" | "preview" | "published";

interface EditorContextType {
  mode: EditorMode;
  onUpdate: (path: string, value: string) => void;
}

export const EditorContext = React.createContext<EditorContextType>({
  mode: "published",
  onUpdate: () => {},
});

interface EditableProps {
  path: string;
  value: string;
  fallback?: string;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  className?: string;
  multiline?: boolean;
}

export const Editable: React.FC<EditableProps> = ({
  path,
  value,
  fallback = "",
  as: Component = "span",
  className = "",
  multiline = false,
}) => {
  const { mode, onUpdate } = React.useContext(EditorContext);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || fallback);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value || fallback);
  }, [value, fallback]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (draft !== value) {
      onUpdate(path, draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setDraft(value || fallback);
      setIsEditing(false);
    }
  };

  if (mode !== "editor") {
    return <Component className={className}>{value || fallback}</Component>;
  }

  if (isEditing) {
    const inputClasses = `bg-black/5 border border-black/20 rounded px-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full ${className}`;
    
    return multiline ? (
      <textarea
        ref={inputRef as any}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClasses}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as any}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClasses}
      />
    );
  }

  return (
    <Component
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`cursor-text hover:outline hover:outline-2 hover:outline-blue-500/50 hover:bg-blue-500/5 transition-all rounded px-1 -ml-1 ${
        !value ? "italic opacity-50" : ""
      } ${className}`}
      title="Click to edit"
    >
      {value || fallback || "Empty text"}
    </Component>
  );
};
