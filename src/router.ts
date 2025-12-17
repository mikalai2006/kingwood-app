import {
  createWebHashHistory,
  createRouter,
  createWebHistory,
} from "vue-router";

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
import ObjectOrder from "./pages/ObjectOrder.vue";
import Notify from "./pages/Notify.vue";
import Financy from "./pages/Financy.vue";
import PayTemplate from "./pages/PayTemplate.vue";
import FinancyOrder from "./pages/FinancyOrder.vue";
import FinancyWorker from "./pages/FinancyWorker.vue";
import CmsArchiveOrder from "./pages/CMS/CmsArchiveOrder.vue";
import CmsDashboard from "./pages/CMS/CmsDashboard.vue";
import CmsArchiveUser from "./pages/CMS/CmsArchiveUser.vue";
import CmsAppError from "./pages/CMS/CmsAppError.vue";
import CmsArchiveNotify from "./pages/CMS/CmsArchiveNotify.vue";
import CmsNotify from "./pages/CMS/CmsNotify.vue";
import ReAuth from "./pages/ReAuth.vue";
import MontajListTele from "./pages/MontajListTele.vue";

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
    path: "/reauth",
    name: "reauth",
    component: ReAuth,
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
    path: "/financy",
    name: "financy",
    component: Financy,
    meta: { requiresAuth: true },
  },
  {
    path: "/payTemplate",
    name: "payTemplate",
    component: PayTemplate,
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
    path: "/taskStatus",
    name: "taskStatus",
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
    path: "/notify",
    name: "notify",
    component: Notify,
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
    path: "/montajList",
    name: "montajList",
    component: MontajList,
    meta: { requiresAuth: true },
  },
  {
    path: "/montajListTele",
    name: "montajListTele",
    component: MontajListTele,
    meta: { requiresAuth: true },
  },
  // {
  //   path: "/montajList/:day",
  //   name: "montajListDay",
  //   component: MontajListDay,
  //   meta: { requiresAuth: true },
  // },

  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/cms-dashboard",
    component: CmsDashboard,
    name: "cms-dashboard",
    meta: { requiresAuth: true },
  },
  {
    path: "/cms-archive-order",
    name: "cms-archive-order",
    component: CmsArchiveOrder,
    meta: { requiresAuth: true },
  },
  {
    path: "/cms-notify",
    name: "cms-notify",
    component: CmsNotify,
    meta: { requiresAuth: true },
  },
  {
    path: "/cms-archive-user",
    name: "cms-archive-user",
    component: CmsArchiveUser,
    meta: { requiresAuth: true },
  },
  {
    path: "/cms-apperror",
    name: "cms-apperror",
    component: CmsAppError,
    meta: { requiresAuth: true },
  },
  {
    path: "/cms-archive-notify",
    name: "cms-archive-notify",
    component: CmsArchiveNotify,
    meta: { requiresAuth: true },
  },
  {
    path: "/object/:objectId",
    name: "objectOrderId",
    component: ObjectOrder,
    meta: { requiresAuth: true },
  },
  {
    path: "/financy/:orderId",
    name: "financyOrder",
    component: FinancyOrder,
    meta: { requiresAuth: true },
  },
  {
    path: "/financy/:workerId",
    name: "financyWorker",
    component: FinancyWorker,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(), //createWebHistory(),
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

router.afterEach((to) => {
  const authStore = useAuthStore();
  // console.log(
  //   "authStore.isAuthenticated = ",
  //   authStore.isAuthenticated,
  //   !authStore.isExpiredAccessToken()
  // );

  if (to.meta.requiresAuth && !authStore.isAuthenticated) return "/auth";
});

export default router;
