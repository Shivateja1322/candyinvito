import React, { createContext, useContext } from "react";

type BuilderContextType = {
  isBuilderMode: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  updateData: (key: string, value: any) => void;
  data: any;
  invitationId?: string;
  userId?: string;
};

const BuilderContext = createContext<BuilderContextType | null>(null);

export function BuilderProvider({
  children,
  isBuilderMode,
  activeSection,
  setActiveSection,
  updateData,
  data,
  invitationId,
  userId,
}: BuilderContextType & { children: React.ReactNode }) {
  return (
    <BuilderContext.Provider
      value={{ isBuilderMode, activeSection, setActiveSection, updateData, data, invitationId, userId }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    // If not in builder context (e.g. public view), return safe defaults
    return {
      isBuilderMode: false,
      activeSection: "",
      setActiveSection: () => {},
      updateData: () => {},
      data: {},
      invitationId: "",
      userId: "",
    };
  }
  return context;
}
