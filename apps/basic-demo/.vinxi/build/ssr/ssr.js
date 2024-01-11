import { isServer, getRequestEvent, createComponent as createComponent$1, delegateEvents, ssrElement, escape, mergeProps, ssr, ssrHydrationKey, ssrStyle, useAssets, NoHydration, HydrationScript, ssrAttribute, Hydration, renderToStream } from "solid-js/web";
import { toWebRequest, getRequestIP, setResponseHeader, setResponseStatus, appendResponseHeader, getResponseHeader, removeResponseHeader, getCookie, setCookie, eventHandler, sendRedirect, setHeader } from "h3";
import { M as MetaProvider, T as Title } from "./assets/index-1b057e40.js";
import { getOwner, runWithOwner, createMemo, createContext, createSignal, createRenderEffect, untrack, useContext, on, startTransition, resetErrorBoundaries, createComponent, children, createRoot, Show, onCleanup, lazy, Suspense, ErrorBoundary as ErrorBoundary$1, createEffect } from "solid-js";
import { p as pageRoutes, m as matchAPIRoute } from "./assets/routes-098a2691.js";
import { provideRequestEvent } from "solid-js/web/storage";
function createBeforeLeave() {
  let listeners = /* @__PURE__ */ new Set();
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  let ignore = false;
  function confirm(to, options) {
    if (ignore)
      return !(ignore = false);
    const e = {
      to,
      options,
      defaultPrevented: false,
      preventDefault: () => e.defaultPrevented = true
    };
    for (const l of listeners)
      l.listener({
        ...e,
        from: l.location,
        retry: (force) => {
          force && (ignore = true);
          l.navigate(to, options);
        }
      });
    return !e.defaultPrevented;
  }
  return {
    subscribe,
    confirm
  };
}
const hasSchemeRegex = /^(?:[a-z0-9]+:)?\/\//i;
const trimPathRegex = /^\/+|(\/)\/+$/g;
function normalizePath(path, omitSlash = false) {
  const s = path.replace(trimPathRegex, "$1");
  return s ? omitSlash || /^[?#]/.test(s) ? s : "/" + s : "";
}
function resolvePath(base, path, from) {
  if (hasSchemeRegex.test(path)) {
    return void 0;
  }
  const basePath = normalizePath(base);
  const fromPath = from && normalizePath(from);
  let result = "";
  if (!fromPath || path.startsWith("/")) {
    result = basePath;
  } else if (fromPath.toLowerCase().indexOf(basePath.toLowerCase()) !== 0) {
    result = basePath + fromPath;
  } else {
    result = fromPath;
  }
  return (result || "/") + normalizePath(path, !result);
}
function joinPaths(from, to) {
  return normalizePath(from).replace(/\/*(\*.*)?$/g, "") + normalizePath(to);
}
function extractSearchParams(url) {
  const params = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
function createMatcher(path, partial, matchFilters) {
  const [pattern, splat] = path.split("/*", 2);
  const segments = pattern.split("/").filter(Boolean);
  const len = segments.length;
  return (location) => {
    const locSegments = location.split("/").filter(Boolean);
    const lenDiff = locSegments.length - len;
    if (lenDiff < 0 || lenDiff > 0 && splat === void 0 && !partial) {
      return null;
    }
    const match = {
      path: len ? "" : "/",
      params: {}
    };
    const matchFilter = (s) => matchFilters === void 0 ? void 0 : matchFilters[s];
    for (let i = 0; i < len; i++) {
      const segment = segments[i];
      const locSegment = locSegments[i];
      const dynamic = segment[0] === ":";
      const key = dynamic ? segment.slice(1) : segment;
      if (dynamic && matchSegment(locSegment, matchFilter(key))) {
        match.params[key] = locSegment;
      } else if (dynamic || !matchSegment(locSegment, segment)) {
        return null;
      }
      match.path += `/${locSegment}`;
    }
    if (splat) {
      const remainder = lenDiff ? locSegments.slice(-lenDiff).join("/") : "";
      if (matchSegment(remainder, matchFilter(splat))) {
        match.params[splat] = remainder;
      } else {
        return null;
      }
    }
    return match;
  };
}
function matchSegment(input, filter) {
  const isEqual = (s) => s.localeCompare(input, void 0, {
    sensitivity: "base"
  }) === 0;
  if (filter === void 0) {
    return true;
  } else if (typeof filter === "string") {
    return isEqual(filter);
  } else if (typeof filter === "function") {
    return filter(input);
  } else if (Array.isArray(filter)) {
    return filter.some(isEqual);
  } else if (filter instanceof RegExp) {
    return filter.test(input);
  }
  return false;
}
function scoreRoute(route) {
  const [pattern, splat] = route.pattern.split("/*", 2);
  const segments = pattern.split("/").filter(Boolean);
  return segments.reduce((score, segment) => score + (segment.startsWith(":") ? 2 : 3), segments.length - (splat === void 0 ? 0 : 1));
}
function createMemoObject(fn) {
  const map = /* @__PURE__ */ new Map();
  const owner = getOwner();
  return new Proxy({}, {
    get(_, property) {
      if (!map.has(property)) {
        runWithOwner(owner, () => map.set(property, createMemo(() => fn()[property])));
      }
      return map.get(property)();
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true
      };
    },
    ownKeys() {
      return Reflect.ownKeys(fn());
    }
  });
}
function expandOptionals(pattern) {
  let match = /(\/?\:[^\/]+)\?/.exec(pattern);
  if (!match)
    return [pattern];
  let prefix = pattern.slice(0, match.index);
  let suffix = pattern.slice(match.index + match[0].length);
  const prefixes = [prefix, prefix += match[1]];
  while (match = /^(\/\:[^\/]+)\?/.exec(suffix)) {
    prefixes.push(prefix += match[1]);
    suffix = suffix.slice(match[0].length);
  }
  return expandOptionals(suffix).reduce((results, expansion) => [...results, ...prefixes.map((p) => p + expansion)], []);
}
const MAX_REDIRECTS = 100;
const RouterContextObj = createContext();
const RouteContextObj = createContext();
function createRoutes$1(routeDef, base = "") {
  const {
    component,
    load,
    children: children2,
    metadata
  } = routeDef;
  const isLeaf = !children2 || Array.isArray(children2) && !children2.length;
  const shared = {
    key: routeDef,
    component,
    load,
    metadata
  };
  return asArray(routeDef.path).reduce((acc, path) => {
    for (const originalPath of expandOptionals(path)) {
      const path2 = joinPaths(base, originalPath);
      const pattern = isLeaf ? path2 : path2.split("/*", 1)[0];
      acc.push({
        ...shared,
        originalPath,
        pattern,
        matcher: createMatcher(pattern, !isLeaf, routeDef.matchFilters)
      });
    }
    return acc;
  }, []);
}
function createBranch(routes2, index = 0) {
  return {
    routes: routes2,
    score: scoreRoute(routes2[routes2.length - 1]) * 1e4 - index,
    matcher(location) {
      const matches = [];
      for (let i = routes2.length - 1; i >= 0; i--) {
        const route = routes2[i];
        const match = route.matcher(location);
        if (!match) {
          return null;
        }
        matches.unshift({
          ...match,
          route
        });
      }
      return matches;
    }
  };
}
function asArray(value) {
  return Array.isArray(value) ? value : [value];
}
function createBranches(routeDef, base = "", stack = [], branches = []) {
  const routeDefs = asArray(routeDef);
  for (let i = 0, len = routeDefs.length; i < len; i++) {
    const def = routeDefs[i];
    if (def && typeof def === "object") {
      if (!def.hasOwnProperty("path"))
        def.path = "";
      const routes2 = createRoutes$1(def, base);
      for (const route of routes2) {
        stack.push(route);
        const isEmptyArray = Array.isArray(def.children) && def.children.length === 0;
        if (def.children && !isEmptyArray) {
          createBranches(def.children, route.pattern, stack, branches);
        } else {
          const branch = createBranch([...stack], branches.length);
          branches.push(branch);
        }
        stack.pop();
      }
    }
  }
  return stack.length ? branches : branches.sort((a, b) => b.score - a.score);
}
function getRouteMatches(branches, location) {
  for (let i = 0, len = branches.length; i < len; i++) {
    const match = branches[i].matcher(location);
    if (match) {
      return match;
    }
  }
  return [];
}
function createLocation(path, state) {
  const origin = new URL("http://sar");
  const url = createMemo((prev) => {
    const path_ = path();
    try {
      return new URL(path_, origin);
    } catch (err) {
      console.error(`Invalid path ${path_}`);
      return prev;
    }
  }, origin, {
    equals: (a, b) => a.href === b.href
  });
  const pathname = createMemo(() => url().pathname);
  const search = createMemo(() => url().search, true);
  const hash = createMemo(() => url().hash);
  const key = () => "";
  return {
    get pathname() {
      return pathname();
    },
    get search() {
      return search();
    },
    get hash() {
      return hash();
    },
    get state() {
      return state();
    },
    get key() {
      return key();
    },
    query: createMemoObject(on(search, () => extractSearchParams(url())))
  };
}
let intent;
function createRouterContext(integration, getBranches, options = {}) {
  const {
    signal: [source, setSource],
    utils = {}
  } = integration;
  const parsePath = utils.parsePath || ((p) => p);
  const renderPath = utils.renderPath || ((p) => p);
  const beforeLeave = utils.beforeLeave || createBeforeLeave();
  const basePath = resolvePath("", options.base || "");
  if (basePath === void 0) {
    throw new Error(`${basePath} is not a valid base path`);
  } else if (basePath && !source().value) {
    setSource({
      value: basePath,
      replace: true,
      scroll: false
    });
  }
  const [isRouting, setIsRouting] = createSignal(false);
  const start = async (callback) => {
    setIsRouting(true);
    try {
      await startTransition(callback);
    } finally {
      setIsRouting(false);
    }
  };
  const [reference, setReference] = createSignal(source().value);
  const [state, setState] = createSignal(source().state);
  const location = createLocation(reference, state);
  const referrers = [];
  const submissions = createSignal(isServer ? initFromFlash2() : []);
  const baseRoute = {
    pattern: basePath,
    params: {},
    path: () => basePath,
    outlet: () => null,
    resolvePath(to) {
      return resolvePath(basePath, to);
    }
  };
  createRenderEffect(() => {
    const {
      value,
      state: state2
    } = source();
    untrack(() => {
      if (value !== reference()) {
        start(() => {
          intent = "native";
          setReference(value);
          setState(state2);
          resetErrorBoundaries();
          submissions[1]([]);
        }).then(() => {
          intent = void 0;
        });
      }
    });
  });
  return {
    base: baseRoute,
    location,
    isRouting,
    renderPath,
    parsePath,
    navigatorFactory,
    beforeLeave,
    preloadRoute,
    submissions
  };
  function navigateFromRoute(route, to, options2) {
    untrack(() => {
      if (typeof to === "number") {
        if (!to)
          ;
        else if (utils.go) {
          beforeLeave.confirm(to, options2) && utils.go(to);
        } else {
          console.warn("Router integration does not support relative routing");
        }
        return;
      }
      const {
        replace,
        resolve,
        scroll,
        state: nextState
      } = {
        replace: false,
        resolve: true,
        scroll: true,
        ...options2
      };
      const resolvedTo = resolve ? route.resolvePath(to) : resolvePath("", to);
      if (resolvedTo === void 0) {
        throw new Error(`Path '${to}' is not a routable path`);
      } else if (referrers.length >= MAX_REDIRECTS) {
        throw new Error("Too many redirects");
      }
      const current = reference();
      if (resolvedTo !== current || nextState !== state()) {
        if (isServer) {
          const e = getRequestEvent();
          e && (e.response = new Response(null, {
            status: 302,
            headers: {
              Location: resolvedTo
            }
          }));
          setSource({
            value: resolvedTo,
            replace,
            scroll,
            state: nextState
          });
        } else if (beforeLeave.confirm(resolvedTo, options2)) {
          const len = referrers.push({
            value: current,
            replace,
            scroll,
            state: state()
          });
          start(() => {
            intent = "navigate";
            setReference(resolvedTo);
            setState(nextState);
            resetErrorBoundaries();
            submissions[1]([]);
          }).then(() => {
            if (referrers.length === len) {
              intent = void 0;
              navigateEnd({
                value: resolvedTo,
                state: nextState
              });
            }
          });
        }
      }
    });
  }
  function navigatorFactory(route) {
    route = route || useContext(RouteContextObj) || baseRoute;
    return (to, options2) => navigateFromRoute(route, to, options2);
  }
  function navigateEnd(next) {
    const first = referrers[0];
    if (first) {
      if (next.value !== first.value || next.state !== first.state) {
        setSource({
          ...next,
          replace: first.replace,
          scroll: first.scroll
        });
      }
      referrers.length = 0;
    }
  }
  function preloadRoute(url, preloadData) {
    const matches = getRouteMatches(getBranches(), url.pathname);
    const prevIntent = intent;
    intent = "preload";
    for (let match in matches) {
      const {
        route,
        params
      } = matches[match];
      route.component && route.component.preload && route.component.preload();
      preloadData && route.load && route.load({
        params,
        location: {
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          query: extractSearchParams(url),
          state: null,
          key: ""
        },
        intent: "preload"
      });
    }
    intent = prevIntent;
  }
  function initFromFlash2() {
    const e = getRequestEvent();
    return e && e.initialSubmission ? [e.initialSubmission] : [];
  }
}
function createRouteContext(router, parent, outlet, match, params) {
  const {
    base,
    location
  } = router;
  const {
    pattern,
    component,
    load
  } = match().route;
  const path = createMemo(() => match().path);
  component && component.preload && component.preload();
  const data = load ? load({
    params,
    location,
    intent: intent || "initial"
  }) : void 0;
  const route = {
    parent,
    pattern,
    path,
    params,
    outlet: () => component ? createComponent(component, {
      params,
      location,
      data,
      get children() {
        return outlet();
      }
    }) : outlet(),
    resolvePath(to) {
      return resolvePath(base.path(), to, path());
    }
  };
  return route;
}
const createRouterComponent = (router) => (props) => {
  const {
    base
  } = props;
  const routeDefs = children(() => props.children);
  const branches = createMemo(() => createBranches(props.root ? {
    component: props.root,
    children: routeDefs()
  } : routeDefs(), props.base || ""));
  const routerState = createRouterContext(router, branches, {
    base
  });
  router.create && router.create(routerState);
  return createComponent$1(RouterContextObj.Provider, {
    value: routerState,
    get children() {
      return createComponent$1(Routes, {
        routerState,
        get branches() {
          return branches();
        }
      });
    }
  });
};
function Routes(props) {
  const matches = createMemo(() => getRouteMatches(props.branches, props.routerState.location.pathname));
  if (isServer) {
    const e = getRequestEvent();
    e && (e.routerMatches || (e.routerMatches = [])).push(matches().map(({
      route,
      path,
      params: params2
    }) => ({
      path: route.originalPath,
      pattern: route.pattern,
      match: path,
      params: params2,
      metadata: route.metadata
    })));
  }
  const params = createMemoObject(() => {
    const m = matches();
    const params2 = {};
    for (let i = 0; i < m.length; i++) {
      Object.assign(params2, m[i].params);
    }
    return params2;
  });
  const disposers = [];
  let root;
  const routeStates = createMemo(on(matches, (nextMatches, prevMatches, prev) => {
    let equal = prevMatches && nextMatches.length === prevMatches.length;
    const next = [];
    for (let i = 0, len = nextMatches.length; i < len; i++) {
      const prevMatch = prevMatches && prevMatches[i];
      const nextMatch = nextMatches[i];
      if (prev && prevMatch && nextMatch.route.key === prevMatch.route.key) {
        next[i] = prev[i];
      } else {
        equal = false;
        if (disposers[i]) {
          disposers[i]();
        }
        createRoot((dispose) => {
          disposers[i] = dispose;
          next[i] = createRouteContext(props.routerState, next[i - 1] || props.routerState.base, createOutlet(() => routeStates()[i + 1]), () => matches()[i], params);
        });
      }
    }
    disposers.splice(nextMatches.length).forEach((dispose) => dispose());
    if (prev && equal) {
      return prev;
    }
    root = next[0];
    return next;
  }));
  return createComponent$1(Show, {
    get when() {
      return routeStates() && root;
    },
    keyed: true,
    children: (route) => createComponent$1(RouteContextObj.Provider, {
      value: route,
      get children() {
        return route.outlet();
      }
    })
  });
}
const createOutlet = (child) => {
  return () => createComponent$1(Show, {
    get when() {
      return child();
    },
    keyed: true,
    children: (child2) => createComponent$1(RouteContextObj.Provider, {
      value: child2,
      get children() {
        return child2.outlet();
      }
    })
  });
};
function intercept([value, setValue], get, set) {
  return [get ? () => get(value()) : value, set ? (v) => setValue(set(v)) : setValue];
}
function querySelector(selector) {
  if (selector === "#") {
    return null;
  }
  try {
    return document.querySelector(selector);
  } catch (e) {
    return null;
  }
}
function createRouter(config) {
  let ignore = false;
  const wrap = (value) => typeof value === "string" ? {
    value
  } : value;
  const signal = intercept(createSignal(wrap(config.get()), {
    equals: (a, b) => a.value === b.value
  }), void 0, (next) => {
    !ignore && config.set(next);
    return next;
  });
  config.init && onCleanup(config.init((value = config.get()) => {
    ignore = true;
    signal[1](wrap(value));
    ignore = false;
  }));
  return createRouterComponent({
    signal,
    create: config.create,
    utils: config.utils
  });
}
function bindEvent(target, type, handler2) {
  target.addEventListener(type, handler2);
  return () => target.removeEventListener(type, handler2);
}
function scrollToHash(hash, fallbackTop) {
  const el = querySelector(`#${hash}`);
  if (el) {
    el.scrollIntoView();
  } else if (fallbackTop) {
    window.scrollTo(0, 0);
  }
}
function getPath(url) {
  const u = new URL(url);
  return u.pathname + u.search;
}
function StaticRouter(props) {
  let e;
  const obj = {
    value: props.url || (e = getRequestEvent()) && getPath(e.request.url) || ""
  };
  return createRouterComponent({
    signal: [() => obj, (next) => Object.assign(obj, next)]
  })(props);
}
const actions = /* @__PURE__ */ new Map();
function setupNativeEvents(preload = true, explicitLinks = false, actionBase = "/_server") {
  return (router) => {
    const basePath = router.base.path();
    const navigateFromRoute = router.navigatorFactory(router.base);
    let preloadTimeout = {};
    function isSvg(el) {
      return el.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function handleAnchor(evt) {
      if (evt.defaultPrevented || evt.button !== 0 || evt.metaKey || evt.altKey || evt.ctrlKey || evt.shiftKey)
        return;
      const a = evt.composedPath().find((el) => el instanceof Node && el.nodeName.toUpperCase() === "A");
      if (!a || explicitLinks && !a.getAttribute("link"))
        return;
      const svg = isSvg(a);
      const href = svg ? a.href.baseVal : a.href;
      const target = svg ? a.target.baseVal : a.target;
      if (target || !href && !a.hasAttribute("state"))
        return;
      const rel = (a.getAttribute("rel") || "").split(/\s+/);
      if (a.hasAttribute("download") || rel && rel.includes("external"))
        return;
      const url = svg ? new URL(href, document.baseURI) : new URL(href);
      if (url.origin !== window.location.origin || basePath && url.pathname && !url.pathname.toLowerCase().startsWith(basePath.toLowerCase()))
        return;
      return [a, url];
    }
    function handleAnchorClick(evt) {
      const res = handleAnchor(evt);
      if (!res)
        return;
      const [a, url] = res;
      const to = router.parsePath(url.pathname + url.search + url.hash);
      const state = a.getAttribute("state");
      evt.preventDefault();
      navigateFromRoute(to, {
        resolve: false,
        replace: a.hasAttribute("replace"),
        scroll: !a.hasAttribute("noscroll"),
        state: state && JSON.parse(state)
      });
    }
    function handleAnchorPreload(evt) {
      const res = handleAnchor(evt);
      if (!res)
        return;
      const [a, url] = res;
      if (!preloadTimeout[url.pathname])
        router.preloadRoute(url, a.getAttribute("preload") !== "false");
    }
    function handleAnchorIn(evt) {
      const res = handleAnchor(evt);
      if (!res)
        return;
      const [a, url] = res;
      if (preloadTimeout[url.pathname])
        return;
      preloadTimeout[url.pathname] = setTimeout(() => {
        router.preloadRoute(url, a.getAttribute("preload") !== "false");
        delete preloadTimeout[url.pathname];
      }, 200);
    }
    function handleAnchorOut(evt) {
      const res = handleAnchor(evt);
      if (!res)
        return;
      const [, url] = res;
      if (preloadTimeout[url.pathname]) {
        clearTimeout(preloadTimeout[url.pathname]);
        delete preloadTimeout[url.pathname];
      }
    }
    function handleFormSubmit(evt) {
      let actionRef = evt.submitter && evt.submitter.hasAttribute("formaction") ? evt.submitter.formAction : evt.target.action;
      if (!actionRef)
        return;
      if (!actionRef.startsWith("action:")) {
        const url = new URL(actionRef);
        actionRef = router.parsePath(url.pathname + url.search);
        if (!actionRef.startsWith(actionBase))
          return;
      }
      if (evt.target.method.toUpperCase() !== "POST")
        throw new Error("Only POST forms are supported for Actions");
      const handler2 = actions.get(actionRef);
      if (handler2) {
        evt.preventDefault();
        const data = new FormData(evt.target);
        handler2.call(router, data);
      }
    }
    delegateEvents(["click", "submit"]);
    document.addEventListener("click", handleAnchorClick);
    if (preload) {
      document.addEventListener("mouseover", handleAnchorIn);
      document.addEventListener("mouseout", handleAnchorOut);
      document.addEventListener("focusin", handleAnchorPreload);
      document.addEventListener("touchstart", handleAnchorPreload);
    }
    document.addEventListener("submit", handleFormSubmit);
    onCleanup(() => {
      document.removeEventListener("click", handleAnchorClick);
      if (preload) {
        document.removeEventListener("mouseover", handleAnchorIn);
        document.removeEventListener("mouseout", handleAnchorOut);
        document.removeEventListener("focusin", handleAnchorPreload);
        document.removeEventListener("touchstart", handleAnchorPreload);
      }
      document.removeEventListener("submit", handleFormSubmit);
    });
  };
}
function Router(props) {
  if (isServer)
    return StaticRouter(props);
  return createRouter({
    get: () => ({
      value: window.location.pathname + window.location.search + window.location.hash,
      state: history.state
    }),
    set({
      value,
      replace,
      scroll,
      state
    }) {
      if (replace) {
        window.history.replaceState(state, "", value);
      } else {
        window.history.pushState(state, "", value);
      }
      scrollToHash(window.location.hash.slice(1), scroll);
    },
    init: (notify) => bindEvent(window, "popstate", () => notify()),
    create: setupNativeEvents(props.preload, props.explicitLinks, props.actionBase),
    utils: {
      go: (delta) => window.history.go(delta)
    }
  })(props);
}
const _tmpl$$4 = " ";
const assetMap = {
  style: (props) => ssrElement("style", props.attrs, () => escape(props.children), true),
  link: (props) => ssrElement("link", props.attrs, void 0, true),
  script: (props) => {
    return props.attrs.src ? ssrElement("script", mergeProps(() => props.attrs, {
      get id() {
        return props.key;
      }
    }), () => ssr(_tmpl$$4), true) : null;
  }
};
function renderAsset(asset) {
  let {
    tag,
    attrs: {
      key,
      ...attrs
    } = {
      key: void 0
    },
    children: children2
  } = asset;
  return assetMap[tag]({
    attrs,
    key,
    children: children2
  });
}
function lazyRoute(component, clientManifest, serverManifest, exported = "default") {
  return lazy(async () => {
    {
      const mod = await component.import();
      const Component = mod[exported];
      let assets = await clientManifest.inputs?.[component.src].assets();
      const styles = assets.filter((asset) => asset.tag === "style" || asset.attrs.rel === "stylesheet");
      const Comp = (props) => {
        return [...styles.map((asset) => renderAsset(asset)), createComponent(Component, props)];
      };
      return {
        default: Comp
      };
    }
  });
}
function createRoutes() {
  function createRoute(route) {
    return {
      ...route,
      ...route.$$route ? route.$$route.require().route : void 0,
      metadata: {
        ...route.$$route ? route.$$route.require().route.metadata : {},
        filesystem: true
      },
      component: lazyRoute(route.$component, globalThis.MANIFEST["client"], globalThis.MANIFEST["ssr"]),
      children: route.children ? route.children.map(createRoute) : void 0
    };
  }
  const routes2 = pageRoutes.map(createRoute);
  return routes2;
}
let routes;
const FileRoutes = () => {
  return isServer ? getRequestEvent().routes : routes || (routes = createRoutes());
};
const app = "";
const _tmpl$$3 = ["<a", ' href="/">Index</a>'], _tmpl$2$2 = ["<a", ' href="/about">About</a>'];
function App() {
  return createComponent$1(Router, {
    root: (props) => createComponent$1(MetaProvider, {
      get children() {
        return [createComponent$1(Title, {
          children: "SolidStart - Basic"
        }), ssr(_tmpl$$3, ssrHydrationKey()), ssr(_tmpl$2$2, ssrHydrationKey()), createComponent$1(Suspense, {
          get children() {
            return props.children;
          }
        })];
      }
    }),
    get children() {
      return createComponent$1(FileRoutes, {});
    }
  });
}
const _tmpl$$2 = ["<div", ' style="padding:16px"><div style="', '"><p style="font-weight:bold" id="error-message">', '</p><button id="reset-errors" style="', '">Clear errors and retry</button><pre style="margin-top:8px;width:100%">', "</pre></div></div>"];
function ErrorBoundary(props) {
  return createComponent$1(ErrorBoundary$1, {
    fallback: (e) => createComponent$1(ErrorMessage, {
      error: e
    }),
    get children() {
      return props.children;
    }
  });
}
function ErrorMessage(props) {
  createEffect(() => console.error(props.error));
  return ssr(_tmpl$$2, ssrHydrationKey(), ssrStyle(`
          background-color: rgba(252, 165, 165);
          color: rgb(153, 27, 27);
          border-radius": 5px;
          overflow: scroll;
          padding: 16px;
          margin-bottom: 8px;
        `), escape(props.error.message), ssrStyle(`color: rgba(252, 165, 165);
            background-color: rgb(153, 27, 27);
            border-radius: 5px;
            padding: 4px 8px`), escape(props.error.stack));
}
const _tmpl$$1 = ["<script", ">", "<\/script>"], _tmpl$2$1 = ["<script", ' type="module" async', "><\/script>"];
const docType = ssr("<!DOCTYPE html>");
function StartServer(props) {
  const context = getRequestEvent();
  let assets = [];
  Promise.resolve().then(async () => {
    let current = context.routes;
    if (context.routerMatches && context.routerMatches[0]) {
      for (let i = 0; i < context.routerMatches[0].length; i++) {
        const match = context.routerMatches[0][i];
        if (match.metadata && match.metadata.filesystem) {
          const segment = current.find((r) => r.path === match.path);
          const part = globalThis.MANIFEST["client"].inputs[segment["$component"].src];
          const asset = await part.assets();
          assets.push.apply(assets, asset);
          current = segment.children;
        }
      }
    }
    assets = [...new Map(assets.map((item) => [item.attrs.key, item])).values()].filter((asset) => asset.attrs.rel === "modulepreload" && !context.assets.find((a) => a.attrs.key === asset.attrs.key));
  });
  useAssets(() => assets.length ? assets.map((m) => renderAsset(m)) : void 0);
  return createComponent$1(NoHydration, {
    get children() {
      return [docType, createComponent$1(props.document, {
        get assets() {
          return [createComponent$1(HydrationScript, {}), context.assets.map((m) => renderAsset(m))];
        },
        get scripts() {
          return [ssr(_tmpl$$1, ssrHydrationKey(), `window.manifest = ${JSON.stringify(context.manifest)}`), ssr(_tmpl$2$1, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST["client"].inputs[globalThis.MANIFEST["client"].handler].output.path, true), false))];
        },
        get children() {
          return createComponent$1(Hydration, {
            get children() {
              return createComponent$1(ErrorBoundary, {
                get children() {
                  return createComponent$1(App, {});
                }
              });
            }
          });
        }
      })];
    }
  });
}
const h3EventSymbol = Symbol("h3Event");
const fetchEventSymbol = Symbol("fetchEvent");
const eventTraps = {
  get(target, prop) {
    if (prop === fetchEventSymbol)
      return target;
    return target[prop] ?? target[h3EventSymbol][prop];
  }
};
function createFetchEvent(event) {
  return new Proxy({
    request: toWebRequest(event),
    clientAddress: getRequestIP(event),
    locals: {},
    // @ts-ignore
    [h3EventSymbol]: event
  }, eventTraps);
}
function getFetchEvent(h3Event) {
  if (!h3Event[fetchEventSymbol]) {
    const fetchEvent = createFetchEvent(h3Event);
    h3Event[fetchEventSymbol] = fetchEvent;
  }
  return h3Event[fetchEventSymbol];
}
function initFromFlash(ctx) {
  const flash = getCookie(ctx, "flash");
  if (!flash)
    return;
  let param = JSON.parse(flash);
  if (!param || !param.result)
    return [];
  const input = [...param.input.slice(0, -1), new Map(param.input[param.input.length - 1])];
  setCookie(ctx, "flash", "", {
    maxAge: 0
  });
  return {
    url: param.url,
    result: param.error ? new Error(param.result) : param.result,
    input
  };
}
async function createPageEvent(ctx) {
  const clientManifest = globalThis.MANIFEST["client"];
  globalThis.MANIFEST["ssr"];
  setResponseHeader(ctx, "Content-Type", "text/html");
  const pageEvent = Object.assign(ctx, {
    manifest: await clientManifest.json(),
    assets: [...await clientManifest.inputs[clientManifest.handler].assets(), ...[]],
    initialSubmission: initFromFlash(ctx),
    routes: createRoutes(),
    components: {
      status: (props) => {
        setResponseStatus(ctx, props.code, props.text);
        return () => setResponseStatus(ctx, 200);
      },
      header: (props) => {
        if (props.append) {
          appendResponseHeader(ctx, props.name, props.value);
        } else {
          setResponseHeader(ctx, props.name, props.value);
        }
        return () => {
          const value = getResponseHeader(ctx, props.name);
          if (value && typeof value === "string") {
            const values = value.split(", ");
            const index = values.indexOf(props.value);
            index !== -1 && values.splice(index, 1);
            if (values.length)
              setResponseHeader(ctx, props.name, values.join(", "));
            else
              removeResponseHeader(ctx, props.name);
          }
        };
      }
    },
    // prevUrl: prevPath || "",
    // mutation: mutation,
    // $type: FETCH_EVENT,
    $islands: /* @__PURE__ */ new Set()
  });
  return pageEvent;
}
function createHandler$1(fn, options = {}) {
  return eventHandler({
    onRequest: options.onRequest,
    onBeforeResponse: options.onBeforeResponse,
    handler: (e) => {
      const event = getFetchEvent(e);
      return provideRequestEvent(event, async () => {
        const match = matchAPIRoute(new URL(event.request.url).pathname, event.request.method);
        if (match) {
          const mod = await match.handler.import();
          const fn2 = mod[event.request.method];
          event.params = match.params;
          return await fn2(event);
        }
        const context = await createPageEvent(event);
        let cloned = {
          ...options
        };
        if (cloned.onCompleteAll) {
          const og = cloned.onCompleteAll;
          cloned.onCompleteAll = (options2) => {
            handleStreamCompleteRedirect(context)(options2);
            og(options2);
          };
        } else
          cloned.onCompleteAll = handleStreamCompleteRedirect(context);
        if (cloned.onCompleteShell) {
          const og = cloned.onCompleteShell;
          cloned.onCompleteShell = (options2) => {
            handleShellCompleteRedirect(context, e)();
            og(options2);
          };
        } else
          cloned.onCompleteShell = handleShellCompleteRedirect(context, e);
        const stream = renderToStream(() => fn(context), cloned);
        if (context.response && context.response.headers.get("Location")) {
          return sendRedirect(event, context.response.headers.get("Location"));
        }
        const {
          writable,
          readable
        } = new TransformStream();
        stream.pipeTo(writable);
        return readable;
      });
    }
  });
}
function handleShellCompleteRedirect(context, e) {
  return () => {
    if (context.response && context.response.headers.get("Location")) {
      setResponseStatus(e, 302);
      setHeader(e, "Location", context.response.headers.get("Location"));
    }
  };
}
function handleStreamCompleteRedirect(context) {
  return ({
    write
  }) => {
    const to = context.response && context.response.headers.get("Location");
    to && write(`<script>window.location="${to}"<\/script>`);
  };
}
function createHandler(fn, options = {}) {
  return createHandler$1(fn, {
    ...options,
    createPageEvent
  });
}
const _tmpl$ = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico">', "</head>"], _tmpl$2 = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const handler = createHandler(() => createComponent$1(StartServer, {
  document: ({
    assets,
    children: children2,
    scripts
  }) => ssr(_tmpl$2, ssrHydrationKey(), createComponent$1(NoHydration, {
    get children() {
      return ssr(_tmpl$, escape(assets));
    }
  }), escape(children2), escape(scripts))
}));
export {
  handler as default
};
