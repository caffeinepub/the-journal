import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getPersistedUrlParameter } from "../utils/urlParams";

/**
 * Silently initializes admin access if the caffeineAdminToken is present
 * in the URL or sessionStorage. Runs automatically on app load after login.
 */
export default function AdminInitializer() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (!identity || !actor || isFetching || initialized.current) return;

    const token = getPersistedUrlParameter("caffeineAdminToken");
    if (!token) return;

    initialized.current = true;

    actor
      ._initializeAccessControlWithSecret(token)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
        queryClient.refetchQueries({ queryKey: ["isAdmin"] });
      })
      .catch(() => {
        // Token may already be initialized or invalid — silent fail
        initialized.current = false;
      });
  }, [identity, actor, isFetching, queryClient]);

  return null;
}
