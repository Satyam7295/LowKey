import { createContext, useContext, useState } from "react";

const AnonymousContext = createContext(null);

export function AnonymousProvider({ children }) {
  const [isAnonymous, setIsAnonymous] = useState(false);

  const toggleAnonymous = () => {
    setIsAnonymous(prev => !prev);
  };

  return (
    <AnonymousContext.Provider value={{ isAnonymous, toggleAnonymous }}>
      {children}
    </AnonymousContext.Provider>
  );
}

export function useAnonymous() {
  const context = useContext(AnonymousContext);
  if (!context) {
    throw new Error("useAnonymous must be used within AnonymousProvider");
  }
  return context;
}
