'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Church } from './types';

interface TenantContextType {
  church: Church | null;
  subdomain: string | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  church: null,
  subdomain: null,
  isLoading: true,
  error: null,
});

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

interface TenantProviderProps {
  children: React.ReactNode;
  initialSubdomain?: string;
}

export function TenantProvider({ children, initialSubdomain }: TenantProviderProps) {
  const [church, setChurch] = useState<Church | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(initialSubdomain || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      if (!subdomain) {
        // Try to get subdomain from hostname
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const parts = hostname.split('.');
          
          if (parts.length > 2 && parts[0] !== 'www') {
            setSubdomain(parts[0]);
          } else {
            // Check for tenant query parameter (development)
            const urlParams = new URLSearchParams(window.location.search);
            const tenantParam = urlParams.get('tenant');
            if (tenantParam) {
              setSubdomain(tenantParam);
            }
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/churches/by-subdomain/${subdomain}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Church not found');
          } else {
            setError('Failed to load church information');
          }
          return;
        }

        const data = await response.json();
        if (data.success) {
          setChurch(data.data);
        } else {
          setError(data.error || 'Failed to load church information');
        }
      } catch (err) {
        console.error('Error loading tenant:', err);
        setError('Failed to load church information');
      } finally {
        setIsLoading(false);
      }
    }

    loadTenant();
  }, [subdomain]);

  const value: TenantContextType = {
    church,
    subdomain,
    isLoading,
    error,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// HOC for pages that require tenant context
export function withTenant<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function TenantWrappedComponent(props: P) {
    return (
      <TenantProvider>
        <WrappedComponent {...props} />
      </TenantProvider>
    );
  };
}

// Hook for getting tenant-aware API endpoints
export function useTenantAPI() {
  const { subdomain } = useTenant();

  return {
    get: (endpoint: string) => `/api/tenant/${subdomain}${endpoint}`,
    post: (endpoint: string, data: any) => 
      fetch(`/api/tenant/${subdomain}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    put: (endpoint: string, data: any) => 
      fetch(`/api/tenant/${subdomain}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    delete: (endpoint: string) => 
      fetch(`/api/tenant/${subdomain}${endpoint}`, {
        method: 'DELETE',
      }),
  };
}