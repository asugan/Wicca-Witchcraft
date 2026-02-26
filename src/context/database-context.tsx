import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { runMigrationsAndSeed } from "@/db/client";

const DatabaseContext = createContext({ isReady: false, error: undefined as Error | undefined });

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    runMigrationsAndSeed()
      .then(() => setIsReady(true))
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))));
  }, []);

  return <DatabaseContext.Provider value={{ isReady, error }}>{children}</DatabaseContext.Provider>;
}

export const useDatabaseReady = () => useContext(DatabaseContext);
