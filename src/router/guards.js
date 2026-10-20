import store from "../store";
import {
  canAccessRouteFromMenu,
  getHomeRouteName,
} from "@/utils/routeAccess";

let userActionsPromise = null;

async function getUserActions() {
  if (!userActionsPromise) {
    userActionsPromise = import(
      "@/composables/sistemas/seguridad/usuarios/useUserActions"
    ).then(({ useUserActions }) => useUserActions());
  }

  return userActionsPromise;
}

async function refreshUserAccessForRoute() {
  const { fetchSectionsActivesByUser } = await getUserActions();
  const result = await fetchSectionsActivesByUser();

  if (!result.ok) {
    const error = result.raw || new Error(result.message);
    error.status = result.status;
    throw error;
  }

  const accessData = result.data ?? {};
  store.commit("setUserAccess", accessData);

  return {
    menu: Array.isArray(accessData?.menu) ? accessData.menu : [],
    homeRouteName: getHomeRouteName(accessData?.home) || store.state.home,
  };
}

function isPasswordChangeRequired(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;

  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

function getMustChangePasswordFlag() {
  return isPasswordChangeRequired(store.state.must_change_password) ||
    isPasswordChangeRequired(sessionStorage.getItem("MUST_CHANGE_PASSWORD"));
}

function isMustChangePasswordError(error) {
  const status = error?.response?.status || error?.status;
  const data = error?.response?.data || {};
  const message = `${data.error || ""} ${data.message || ""}`;

  return status === 403 && message.includes("Debe cambiar su contraseña");
}

function redirectToPasswordChange(next) {
  store.commit("setMustChangePassword", true);
  return next({ name: "password-change" });
}

export function registerRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const isAuthenticated = !!store.state.user.token;
    const isGuestRoute = to.meta.isGuest;
    const requiresAuth = to.meta.requiresAuth;
    let homeRouteName = store.state.home;
    const mustChangePassword = getMustChangePasswordFlag();

    // usuario no autenticado y ruta ptotegida
    if (requiresAuth && !isAuthenticated) {
      return next({ name: "Login" });
    }

    // usuario autenticado pero debe cambiar su contraseña
    if (
      isAuthenticated &&
      mustChangePassword &&
      to.name !== "password-change"
    ) {
      return next({ name: "password-change" });
    }

    // usuario autenticado en ruta de invitados como login
    if (isAuthenticated && isGuestRoute) {
      try {
        const access = await refreshUserAccessForRoute();
        homeRouteName = access.homeRouteName || homeRouteName;
      } catch (error) {
        const status = error?.response?.status || error?.status;

        if (status === 401) {
          store.commit("logout");
          return next({ name: "Login" });
        }

        if (isMustChangePasswordError(error)) {
          return redirectToPasswordChange(next);
        }

        // Si falla el refresco, se conserva el home local para no bloquear el flujo.
      }

      if (!homeRouteName) return next();
      return next({ name: homeRouteName });
    }

    // usuario que ya cambió su contraseña pero intenta ir a la vista de cambio
    if (
      isAuthenticated &&
      !mustChangePassword &&
      to.name === "password-change" &&
      homeRouteName
    ) {
      return next({ name: homeRouteName });
    }

    if (
      isAuthenticated &&
      requiresAuth &&
      !to.meta.public &&
      to.name !== "password-change"
    ) {
      let menu = store.state.menu;
      let accessWasRefreshed = false;

      try {
        const access = await refreshUserAccessForRoute();
        menu = access.menu;
        homeRouteName = access.homeRouteName || homeRouteName;
        accessWasRefreshed = true;
      } catch (error) {
        const status = error?.response?.status || error?.status;

        if (status === 401) {
          store.commit("logout");
          return next({ name: "Login" });
        }

        if (isMustChangePasswordError(error)) {
          return redirectToPasswordChange(next);
        }

        if (status === 403 && homeRouteName && to.name !== homeRouteName) {
          return next({ name: homeRouteName });
        }

        if (status === 403) {
          return next(false);
        }
      }

      if (
        homeRouteName &&
        !canAccessRouteFromMenu(to, menu, homeRouteName, {
          allowEmptyMenu: !accessWasRefreshed,
        })
      ) {
        return next({ name: homeRouteName });
      }
    }

    // Setear título y continuar normalmente
    const pageTitle = to.meta?.title || 'Inicio';
    const finalTitle = typeof pageTitle === 'string'
      ? pageTitle
      : (pageTitle.text || 'Inicio');
    document.title = `Web Transaccional Tuval | ${finalTitle}`;

    return next();
  });
}
