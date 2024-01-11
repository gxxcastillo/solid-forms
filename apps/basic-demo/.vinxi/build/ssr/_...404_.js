import { isServer, getRequestEvent, ssr, ssrHydrationKey, escape, createComponent } from "solid-js/web";
import { T as Title } from "./assets/index-1b057e40.js";
import "./assets/routes-098a2691.js";
import { onCleanup } from "solid-js";
function HttpStatusCode(props) {
  if (isServer) {
    const event = getRequestEvent();
    if (event)
      onCleanup(event.components.status(props));
  }
  return null;
}
const _tmpl$ = ["<main", "><!--$-->", "<!--/--><!--$-->", '<!--/--><h1>Page Not Found</h1><p>Visit <a href="https://start.solidjs.com" target="_blank">start.solidjs.com</a> to learn how to build SolidStart apps.</p></main>'];
function NotFound() {
  return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Title, {
    children: "Not Found"
  })), escape(createComponent(HttpStatusCode, {
    code: 404
  })));
}
export {
  NotFound as default
};
