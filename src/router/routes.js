const routes = [
  {
    path: '/',
    component: () => import('layouts/BuilderLayout.vue'),
    children: [{ path: '', component: () => import('pages/Designer.vue') }],
  },
  {
    path: '/builder',
    component: () => import('layouts/BuilderLayout.vue'),
    children: [{ path: '', component: () => import('pages/Designer.vue') }],
  },
  {
    path: '/project/:project/:view',
    component: () => import('layouts/ViewerLayout.vue'),
    children: [{ path: '', component: () => import('pages/VisualizerPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

