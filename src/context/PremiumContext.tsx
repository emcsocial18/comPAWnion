import React, { createContext, useContext, useState } from 'react';

type PremiumContextType = {
  premium: boolean;
  togglePremium: (next?: boolean) => void;
};

const PremiumContext = createContext<PremiumContextType>({ premium: false, togglePremium: () => {} });

export const PremiumProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [premium, setPremium] = useState(false);
  function togglePremium(next?: boolean){
    setPremium(v => typeof next === 'boolean' ? next : !v);
  }
  return (
    <PremiumContext.Provider value={{ premium, togglePremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export function usePremium(){
  return useContext(PremiumContext);
}

export { PremiumContext };
