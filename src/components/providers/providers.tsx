import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}
