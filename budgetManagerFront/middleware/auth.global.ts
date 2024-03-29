import Cookies from "js-cookie";

export default defineNuxtRouteMiddleware((to, from) => {
  const token = Cookies.get("jwtToken");
  setTimeout(() => {
    if (!token && to.path !== "/login-page" && to.path !== "/register-page") {
      return navigateTo("/login-page");
    }
  }, 1000);
});
