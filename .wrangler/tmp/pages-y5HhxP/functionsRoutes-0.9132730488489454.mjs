import { onRequestPost as __api_auth_login_js_onRequestPost } from "C:\\Users\\zhffl\\Downloads\\project\\functions\\api\\auth\\login.js"
import { onRequestPost as __api_auth_register_js_onRequestPost } from "C:\\Users\\zhffl\\Downloads\\project\\functions\\api\\auth\\register.js"
import { onRequestDelete as __api_itineraries_js_onRequestDelete } from "C:\\Users\\zhffl\\Downloads\\project\\functions\\api\\itineraries.js"
import { onRequestGet as __api_itineraries_js_onRequestGet } from "C:\\Users\\zhffl\\Downloads\\project\\functions\\api\\itineraries.js"
import { onRequestPost as __api_itineraries_js_onRequestPost } from "C:\\Users\\zhffl\\Downloads\\project\\functions\\api\\itineraries.js"
import { onRequestPut as __api_itineraries_js_onRequestPut } from "C:\\Users\\zhffl\\Downloads\\project\\functions\\api\\itineraries.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_js_onRequestPost],
    },
  {
      routePath: "/api/itineraries",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_itineraries_js_onRequestDelete],
    },
  {
      routePath: "/api/itineraries",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_itineraries_js_onRequestGet],
    },
  {
      routePath: "/api/itineraries",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_itineraries_js_onRequestPost],
    },
  {
      routePath: "/api/itineraries",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_itineraries_js_onRequestPut],
    },
  ]