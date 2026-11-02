(function installProfessorMapRouteResolver(root, factory) {
  const resolveProfessorMapRoute = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = resolveProfessorMapRoute;
  } else {
    root.resolveProfessorMapRoute = resolveProfessorMapRoute;
  }
})(typeof window === "undefined" ? globalThis : window, function createProfessorMapRouteResolver() {
  const DESTINATIONS = new Set(["class", "research", "classRecorded", "classOnsite"]);

  return function resolveProfessorMapRoute(map, courseCode, routeKey) {
    if (!map || map.count !== 29 || !Array.isArray(map.professors) || map.professors.length !== 29
      || !map.routes || !DESTINATIONS.has(routeKey) || typeof courseCode !== "string" || !courseCode) return null;
    const matches = map.professors.filter((professor) => professor && professor.courseCode === courseCode);
    if (matches.length !== 1) return null;

    const professor = matches[0];
    const destination = professor[routeKey];
    const routePath = map.routes[routeKey];
    if (typeof map.base !== "string" || typeof destination !== "string" || typeof routePath !== "string"
      || !professor.slug) return null;
    try {
      const base = new URL(map.base);
      const target = new URL(destination);
      const expectedPath = new URL(routePath, base);
      if (base.protocol !== "https:" || target.origin !== base.origin || target.protocol !== "https:"
        || target.pathname !== expectedPath.pathname) return null;
      const query = [...target.searchParams.entries()];
      if (professor.slug === "gunther-roland") {
        if (query.length) return null;
      } else if (query.length !== 1 || query[0][0] !== "p" || query[0][1] !== professor.slug) return null;
      return destination;
    } catch {
      return null;
    }
  };
});
