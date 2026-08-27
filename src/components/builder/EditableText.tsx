import React, { useRef, useEffect, useState } from "react";
import { useBuilder } from "./BuilderContext";
import { getByPath } from "../../lib/fieldPath";

type EditableTextProps = {
  path?: string;
  dataKey?: string; // Legacy support
  defaultText: string;
  className?: string;
  as?: React.ElementType;
};

export const EditableText: React.FC<EditableTextProps> = ({
  path,
  dataKey,
  defaultText,
  className = "",
  as: Component = "span",
}) => {
  const { isBuilderMode, updateData, data } = useBuilder();
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const activePath = path || dataKey || "";
  const val = getByPath(data, activePath);
  const content = val !== undefined && val !== "" ? val : defaultText;

  useEffect(() => {
    if (elementRef.current && !isEditing) {
      elementRef.current.innerText = content;
    }
  }, [content, isEditing]);

  if (!isBuilderMode) {
    return <Component className={className}>{content}</Component>;
  }

  const handleBlur = () => {
    setIsEditing(false);
    if (elementRef.current) {
      const newText = elementRef.current.innerText.trim();
      if (activePath) {
        updateData(activePath, newText);
      }
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  return (
    <Component
      ref={elementRef as any}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={`transition-all outline-none cursor-text ${className} ${
        isEditing
          ? "ring-1 ring-gray-500/30 bg-gray-500/10 rounded px-1 relative z-10 shadow-sm"
          : "hover:ring-1 hover:ring-gray-500/30 hover:bg-gray-500/10 hover:rounded px-1"
      }`}
      style={{ minWidth: "1px", display: "inline-block", wordBreak: "break-word" }}
    />
  );
};
