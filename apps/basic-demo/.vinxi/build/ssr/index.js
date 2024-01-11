import { ssr, ssrHydrationKey, escape, createComponent } from "solid-js/web";
import { T as Title } from "./assets/index-1b057e40.js";
import { createSignal } from "solid-js";
const Counter$1 = "";
const _tmpl$$1 = ["<button", ' class="increment">Clicks: <!--$-->', "<!--/--></button>"];
function Counter() {
  const [count, setCount] = createSignal(0);
  return ssr(_tmpl$$1, ssrHydrationKey(), escape(count()));
}
const _tmpl$ = ["<main", "><!--$-->", "<!--/--><h1>Hello world!</h1><!--$-->", '<!--/--><p>Visit <a href="https://start.solidjs.com" target="_blank">start.solidjs.com</a> to learn how to build SolidStart apps.</p></main>'];
function Home() {
  return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Title, {
    children: "Hello World"
  })), escape(createComponent(Counter, {})));
}
export {
  Home as default
};
