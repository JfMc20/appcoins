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

const Pathnames = {
  home: '/',
  admin: Admin,
  user: User,
  auth: Auth,
}

export default Pathnames
