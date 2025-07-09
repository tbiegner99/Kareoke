/**
 * Dependencies Provider
 *
 * React context provider for dependency injection throughout the application.
 * This allows components to access services and other dependencies without
 * prop drilling or direct imports.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import {
  Dependencies,
  dependencies as defaultDependencies,
} from '../dependencies';

const DependenciesContext = createContext<Dependencies | null>(null);

interface DependenciesProviderProps {
  children: ReactNode;
  dependencies?: Dependencies;
}

export const DependenciesProvider: React.FC<DependenciesProviderProps> = ({
  children,
  dependencies = defaultDependencies,
}) => {
  return (
    <DependenciesContext.Provider value={dependencies}>
      {children}
    </DependenciesContext.Provider>
  );
};

/**
 * Hook to access dependencies from context
 */
export const useDependencies = (): Dependencies => {
  const context = useContext(DependenciesContext);
  if (!context) {
    throw new Error(
      'useDependencies must be used within a DependenciesProvider'
    );
  }
  return context;
};

/**
 * Hook to access specific services
 */
export const useServices = () => {
  const { services } = useDependencies();
  return services;
};

/**
 * Hook to access specific datasources
 */
export const useDatasources = () => {
  const { datasources } = useDependencies();
  return datasources;
};
