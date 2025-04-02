import React, { createContext, useState, useContext, useEffect } from 'react';

// Lista de tenanți disponibili pentru demo
const AVAILABLE_TENANTS = [
  { id: 'tenanta', name: 'Școala Nr. 1', color: '#1976d2' },
  { id: 'tenantb', name: 'Liceul Tehnologic', color: '#388e3c' },
  { id: 'tenantc', name: 'Colegiul Național', color: '#d32f2f' }
];

// Crearea contextului tenant
const TenantContext = createContext();

// Hook pentru utilizarea contextului tenant
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant trebuie utilizat în interiorul unui TenantProvider');
  }
  return context;
};

// Provider pentru contextul tenant
export const TenantProvider = ({ children }) => {
  // Starea pentru tenant-ul curent
  const [currentTenant, setCurrentTenant] = useState(() => {
    // Încercare de a prelua tenant-ul din localStorage la încărcarea paginii
    const savedTenant = localStorage.getItem('currentTenant');
    return savedTenant ? JSON.parse(savedTenant) : AVAILABLE_TENANTS[0];
  });
  
  // Lista de tenanți disponibili
  const [availableTenants] = useState(AVAILABLE_TENANTS);
  
  // Actualizează localStorage când se schimbă tenant-ul
  useEffect(() => {
    localStorage.setItem('currentTenant', JSON.stringify(currentTenant));
  }, [currentTenant]);
  
  // Funcție pentru schimbarea tenant-ului
  const changeTenant = (tenantId) => {
    const tenant = availableTenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
    }
  };
  
  // Valorile expuse în context
  const value = {
    currentTenant,
    availableTenants,
    changeTenant
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext; 