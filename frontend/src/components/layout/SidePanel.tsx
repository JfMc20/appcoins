import type React from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Pathnames from '../../router/pathnames'
import {
  FaHome,
  FaUsers,
  FaGamepad,
  FaHistory,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaCoins,
  FaExchangeAlt,
  FaWallet,
  FaAddressBook,
  FaCog,
} from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { Icon } from '../common'

// Definir la estructura de un ítem de navegación
interface NavItem {
  title: string
  path: string
  iconName: keyof typeof iconComponents
  roles?: ('admin' | 'operator')[]
}

// Agrupar los ítems de navegación por secciones
interface NavSection {
  title: string
  items: NavItem[]
  roles?: ('admin' | 'operator')[]
}

// Objeto con componentes de iconos
const iconComponents: Record<string, IconType> = {
  home: FaHome,
  users: FaUsers,
  gamepad: FaGamepad,
  history: FaHistory,
  plus: FaPlus,
  coins: FaCoins,
  exchange: FaExchangeAlt,
  chevronLeft: FaChevronLeft,
  chevronRight: FaChevronRight,
  wallet: FaWallet,
  addressBook: FaAddressBook,
  cog: FaCog,
}

const navSections: NavSection[] = [
  {
    title: 'General',
    items: [{ title: 'Dashboard', path: Pathnames.home, iconName: 'home' }],
  },
  {
    title: 'Administración',
    roles: ['admin'],
    items: [
      { title: 'Usuarios', path: Pathnames.admin.users, iconName: 'users' },
      { title: 'Juegos', path: Pathnames.admin.games.root, iconName: 'gamepad' },
      { title: 'Tasas de Cambio', path: Pathnames.admin.exchangeRates, iconName: 'exchange' },
      { title: 'Ajustes App', path: Pathnames.admin.appSettings, iconName: 'cog' },
    ],
  },
  {
    title: 'Transacciones',
    items: [
      { title: 'Historial', path: Pathnames.transactions.history, iconName: 'history' },
      { title: 'Nueva Transacción', path: Pathnames.transactions.new, iconName: 'plus' },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { title: 'Fuentes de Fondos', path: Pathnames.funding.list, iconName: 'wallet' },
      { title: 'Contactos', path: Pathnames.contacts.list, iconName: 'addressBook' },
    ],
  },
  // La sección de herramientas ha sido eliminada para mayor seguridad
  // Ahora se accede mediante rutas directas
]

const SidePanel: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className={`h-screen bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="text-yellow-500 text-2xl mr-2">
              <Icon icon={iconComponents.coins} />
            </div>
            <h1 className="font-bold text-xl">VGMarket</h1>
          </div>
        )}
        {isCollapsed && (
          <div className="text-yellow-500 text-xl mx-auto">
            <Icon icon={iconComponents.coins} />
          </div>
        )}
        <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-400 hover:text-white">
          {isCollapsed ? <Icon icon={iconComponents.chevronRight} /> : <Icon icon={iconComponents.chevronLeft} />}
        </button>
      </div>

      <div className="mt-6">
        {navSections.map((section, idx) => {
          // Solo mostrar secciones permitidas para el rol del usuario
          if (section.roles && user?.role && !section.roles.includes(user.role)) {
            return null
          }

          return (
            <div key={idx.toString()} className="mb-6">
              {!isCollapsed && (
                <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-4 mb-2">
                  {section.title}
                </h2>
              )}
              <ul>
                {section.items.map((item, itemIdx) => {
                  // Solo mostrar ítems permitidos para el rol del usuario
                  if (item.roles && user?.role && !item.roles.includes(user.role)) {
                    return null
                  }

                  return (
                    <li key={itemIdx.toString()}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-700 ${
                          isActive(item.path) ? 'bg-gray-700 font-medium' : ''
                        }`}
                      >
                        <span className={`text-lg ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                          <Icon icon={iconComponents[item.iconName]} />
                        </span>
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SidePanel
