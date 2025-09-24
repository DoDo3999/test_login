// public/js/main.js
import { Login } from "./pages/login.js";
import { Register } from "./pages/register.js";
import { Profile } from "./pages/profile.js";

export function go(path) {
  location.hash = path.startsWith("#") ? path : `#${path}`;
}

const routes = {
  "/login": Login,
  "/register": Register,   
  "/profile": Profile,
};

function render() {
  const path = location.hash.replace(/^#/, "") || "/login";
  const Page = routes[path] || Login;


  const root = document.getElementById("app") || document.body;
  root.innerHTML = "";
  Page();
}


window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);


if (!location.hash) go("/login");
