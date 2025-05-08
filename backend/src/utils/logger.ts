import chalk from 'chalk';

// Función auxiliar para obtener timestamp
const getTimestamp = (): string => new Date().toISOString();

// Configuración centralizada (podría expandirse en el futuro)
const config = {
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  showTimestamp: true,
};

// Niveles de log (para posible filtrado futuro)
const levels: { [key: string]: number } = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3, // Para logs HTTP específicos
  db: 4,   // Para logs de base de datos
  cron: 5, // Para logs de tareas cron
  debug: 6,
};

const currentLevel = levels[config.logLevel.toLowerCase()] ?? levels.info; // Default a info si no se reconoce

const log = (level: string, levelColor: chalk.Chalk, ...args: any[]) => {
  const messageLevel = levels[level.toLowerCase()] ?? levels.info;
  if (messageLevel <= currentLevel) {
    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = config.showTimestamp ? `[${getTimestamp()}]` : '';
    console.log(chalk.gray(timestamp), levelColor(prefix), ...args);
  }
};

const logError = (level: string, levelColor: chalk.Chalk, ...args: any[]) => {
    const messageLevel = levels[level.toLowerCase()] ?? levels.info;
    if (messageLevel <= currentLevel) {
        const prefix = `[${level.toUpperCase()}]`;
        const timestamp = config.showTimestamp ? `[${getTimestamp()}]` : '';
        console.error(chalk.gray(timestamp), levelColor(prefix), ...args); // Usar console.error
    }
};

export const logger = {
  info: (...args: any[]) => log('info', chalk.blue, ...args),
  success: (...args: any[]) => log('success', chalk.green, ...args),
  warn: (...args: any[]) => log('warn', chalk.yellow, ...args),
  error: (...args: any[]) => logError('error', chalk.red, ...args), // Llama a logError
  debug: (...args: any[]) => log('debug', chalk.magenta, ...args),
  db: (...args: any[]) => log('db', chalk.cyan, ...args),
  cron: (...args: any[]) => log('cron', chalk.white.bgBlue.bold, ...args),
  http: (method: string, url: string, status: number, responseTime?: number) => {
    const level = 'http';
    const messageLevel = levels[level.toLowerCase()] ?? levels.info;
    if (messageLevel <= currentLevel) {
        const statusColor = status >= 500 ? chalk.red
                         : status >= 400 ? chalk.yellow
                         : status >= 300 ? chalk.cyan
                         : chalk.green;
        const timestamp = config.showTimestamp ? `[${getTimestamp()}]` : '';
        const timeString = responseTime !== undefined ? ` - ${responseTime}ms` : '';
        console.log(
            chalk.gray(timestamp),
            chalk.white.bgGreen.bold(`[${level.toUpperCase()}]`),
            method,
            url,
            statusColor(status),
            timeString
        );
    }
  },
  // Función para establecer el nivel de log dinámicamente si es necesario
  // setLevel: (newLevel: string) => {
  //   currentLevel = levels[newLevel.toLowerCase()] ?? levels.info;
  //   config.logLevel = newLevel;
  //   logger.info(`Log level set to: ${config.logLevel}`);
  // }
}; 