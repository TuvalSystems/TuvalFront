import Maintenance from '@/views/errors/Page503.vue';

const PasswordChange = () => import("@/views/auth/PasswordChange.vue");

export const baseRoutes = [
  {
    path: "/",
    redirect: "/ventas/consultas",
    requiresAuth: true,
  },
  {
    path: "/password-change",
    name: "password-change",
    component: PasswordChange,
    meta: { requiresAuth: true },
    title: "Cambiar Contraseña",
  },
];

export const guestAndPublicRoutes = [
  //login

  {
    path: "/auth",
    redirect: "/login",
    name: "Auth",
    component: () => import("@/components/AuthLayout.vue"),
    meta: {
      isGuest: true,
      title: "Login",
    },
    children: [
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/auth/Login.vue"),
      },
    ],
  },

  /** mantenimiento  */
  {
    path: '/mantenimiento',
    name: 'Maintenance',
    component: Maintenance,
    meta: {
      layout: 'simple', // Si usas layouts, usa uno limpio (sin sidebar/header)
      public: true      // Marca para que no requiera auth (si usas middleware de auth)
    }
  },

  /** dashboard de mantenimiento */
  {
    path: "/dashboard/pendientes-despacho/:ptovta",
    name: "dashboard-pendientes-despacho",
    component: () => import("@/views/bodegas/dashboard/PendingDispatchDashboard.vue"),
    props: true,
    meta: {
      layout: 'simple',
      public: true
    }
  },
];
