import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useQuery } from "@tanstack/react-query";

type ActivePlanResponse = {
  active?: boolean;
  plan?: { _id?: string; name?: string };
  subscription?: {
    status?: string;
    paymentStatus?: string;
    billingCycle?: string;
  };
};

export const useSubscriptionStatus = (
  token?: string,
  userId?: string | null
) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["active-plan", userId],
    enabled: Boolean(token && userId),
    refetchOnMount: "always",
    queryFn: async (): Promise<ActivePlanResponse | null> => {
      const res = await fetch(
        `http://192.168.1.36:9991/users/subscriptions/active/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch active plan");
      const json = await res.json();
      return json?.data ?? null;
    },
  });

  // Refresh when app returns from background (e.g., after payment)
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        refetch();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [refetch]);

  const isSubscribed =
    data?.active === true &&
    (data?.subscription?.status || "").toLowerCase() === "active" &&
    (data?.subscription?.paymentStatus || "").toLowerCase() === "completed";

  const billingCycle =
    data?.subscription?.billingCycle?.toLowerCase() ?? null;

  return { isSubscribed, billingCycle, isLoading, refetch };
};
