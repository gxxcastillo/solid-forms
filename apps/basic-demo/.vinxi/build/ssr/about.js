import { ssr, ssrHydrationKey, escape, createComponent } from "solid-js/web";
import { T as Title } from "./assets/index-1b057e40.js";
import "solid-js";
const _tmpl$ = ["<main", "><!--$-->", "<!--/--><h1>About</h1></main>"];
function Home() {
  return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Title, {
    children: "About"
  })));
}
export {
  Home as default
};
