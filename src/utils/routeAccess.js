const ROUTES_WITHOUT_MENU_ACCESS = [
  "Login",
  "Auth",
  "password-change",
  "notificaciones",
  "Maintenance",
];

export function getRouteAccessName(route) {
  return route?.meta?.extends || route?.name || null;
}

export function getHomeRouteName(home) {
  if (typeof home === "string") return home;
  return home?.to || null;
}

export function isRouteInMenu(items, targetRouteName) {
  if (!Array.isArray(items) || !targetRouteName) return false;

  return items.some((item) => {
    if (item?.to === targetRouteName) return true;
    return isRouteInMenu(item?.sub, targetRouteName);
  });
}

export function canAccessRouteFromMenu(
  route,
  menu,
  homeRouteName,
  { allowEmptyMenu = true } = {}
) {
  const routeName = getRouteAccessName(route);

  if (!routeName) return true;
  if (route?.meta?.public || route?.meta?.isGuest) return true;
  if (ROUTES_WITHOUT_MENU_ACCESS.includes(routeName)) return true;
  if (homeRouteName && routeName === homeRouteName) return true;

  if (!Array.isArray(menu) || menu.length === 0) return allowEmptyMenu;

  return isRouteInMenu(menu, routeName);
}
