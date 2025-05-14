const Admin = {
  home: '/admin',
  users: '/admin/users',
  games: {
    root: '/admin/games',
    items: '/admin/games/:gameId/items',
  },
  products: '/admin/products',
  orders: '/admin/orders',
  settings: '/admin/settings',
  exchangeRates: '/admin/exchange-rates',
}

const User = {
  home: '/',
  products: '/products',
  cart: '/cart',
}

const Auth = {
  login: '/login',
  register: '/register',
}

const Transactions = {
  history: '/transactions',
  new: '/transactions/new',
}

const Funding = {
  list: '/funding-sources',
  new: '/funding-sources/new',
  edit: '/funding-sources/edit/:id',
}

// Herramientas de diagnóstico ocultas con una ruta compleja para evitar descubrimiento por fuzzing
const SecureTools = {
  base: '/secure-system-diagnostics-5f7e3a9d8c1b6',
  userRole: '/secure-system-diagnostics-5f7e3a9d8c1b6/user-inspector',
  fixAdmin: '/secure-system-diagnostics-5f7e3a9d8c1b6/admin-tools',
  loginDebug: '/secure-system-diagnostics-5f7e3a9d8c1b6/auth-analyzer',
}

// Mantener las rutas antiguas temporalmente para compatibilidad
const Debug = {
  userRole: '/debug/user-role',
  fixAdmin: '/debug/fix-admin',
  loginDebug: '/debug/login',
}

const Pathnames = {
  home: '/',
  admin: Admin,
  user: User,
  auth: Auth,
  transactions: Transactions,
  funding: Funding,
  debug: Debug,
  secureTools: SecureTools,
  contacts: {
    list: '/contacts',
    new: '/contacts/new',
    edit: '/contacts/edit/:contactId',
  },
}

export default Pathnames
