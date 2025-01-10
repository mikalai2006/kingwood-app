import { createWebHashHistory, createRouter } from "vue-router";

import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Auth from "./pages/Auth.vue";
import Dashboard from "./pages/Dashboard.vue";
import Role from "./pages/Role.vue";
import { useAuthStore } from "./store";
import User from "./pages/User.vue";
import Post from "./pages/Post.vue";
import Order from "./pages/Order.vue";
import Operation from "./pages/Operation.vue";
import TaskStatus from "./pages/TaskStatus.vue";
import Object from "./pages/Object.vue";
import Account from "./pages/Account.vue";
import MontajList from "./pages/MontajList.vue";
import MontajListDay from "./pages/MontajListDay.vue";
import ObjectOrder from "./pages/ObjectOrder.vue";
import Montaj from "./pages/Montaj.vue";

const routes = [
  {
    path: "/",
    component: Home,
    meta: { requiresAuth: true },
  },
  { path: "/about", component: About, meta: { requiresAuth: true } },
  {
    path: "/auth",
    name: "auth",
    component: Auth,
    meta: {},
  },
  {
    path: "/role",
    name: "role",
    component: Role,
    meta: { requiresAuth: true },
  },
  {
    path: "/post",
    name: "post",
    component: Post,
    meta: { requiresAuth: true },
  },
  {
    path: "/order",
    name: "order",
    component: Order,
    meta: { requiresAuth: true },
  },
  {
    path: "/operation",
    name: "operation",
    component: Operation,
    meta: { requiresAuth: true },
  },
  {
    path: "/task_status",
    name: "task_status",
    component: TaskStatus,
    meta: { requiresAuth: true },
  },
  {
    path: "/user",
    name: "user",
    component: User,
    meta: { requiresAuth: true },
  },
  {
    path: "/object",
    name: "object",
    component: Object,
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    name: "account",
    component: Account,
    meta: { requiresAuth: true },
  },
  {
    path: "/montaj",
    name: "montaj",
    component: Montaj,
    meta: { requiresAuth: true },
  },
  {
    path: "/montajList",
    name: "montajList",
    component: MontajList,
    meta: { requiresAuth: true },
  },
  {
    path: "/montajList/:day",
    name: "montajListDay",
    component: MontajListDay,
    meta: { requiresAuth: true },
  },

  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/object/:objectId",
    name: "objectOrderId",
    component: ObjectOrder,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  // console.log(
  //   "authStore.isAuthenticated = ",
  //   authStore.isAuthenticated,
  //   !authStore.isExpiredAccessToken()
  // );

  if (to.meta.requiresAuth && !authStore.isAuthenticated) return "/auth";
});

export default router;
