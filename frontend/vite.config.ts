import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  // Cargar variables de entorno del .env apropiado
  // Esto es importante si tienes VITE_PORT en tu .env y quieres que se respete
  const env = loadEnv(mode, process.cwd(), '')

  // Definir el hostname permitido, con un fallback por si no está en .env
  const allowedHostname = env.VITE_ALLOWED_HOSTNAME || 'localhost'

  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      // host: '0.0.0.0', // Esto ya lo manejas con el flag --host 0.0.0.0 en package.json
      port: parseInt(env.VITE_PORT) || 5173,
      allowedHosts: [allowedHostname, '.' + allowedHostname], // Permite el dominio y subdominios del mismo.
                                                              // O simplemente [allowedHostname] si no necesitas subdominios.
      // Si necesitas que HMR funcione correctamente cuando accedes por este dominio,
      // también podrías necesitar configurar hmr:
      // hmr: {
      //   host: allowedHostname, // Usar también para HMR si es necesario
      //   protocol: 'ws',
      // }
    }
  })
}
