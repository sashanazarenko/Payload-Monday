import { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../types';

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);
// stage-1 branch is intentionally admin-only.
const isStagePreview = true;

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('admin');

  const setCurrentRole = (role: UserRole) => {
    if (isStagePreview) {
      // In stage preview we keep an admin-only view.
      setCurrentRoleState('admin');
      return;
    }
    setCurrentRoleState(role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}
