"use client";

import { useEffect } from "react";

import { useCustomerSession } from "@/lib/stores/customer-session";

export function CustomerSessionProvider({ children }: { children: React.ReactNode }) {
  const refresh = useCustomerSession((state) => state.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return children;
}
