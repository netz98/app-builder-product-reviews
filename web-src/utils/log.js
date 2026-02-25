const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

const getLogLevel = () => {
  if (typeof window !== 'undefined') {
    if (window.APP_CONFIG && window.APP_CONFIG.LOG_LEVEL) {
      return String(window.APP_CONFIG.LOG_LEVEL).toLowerCase()
    }
  }
  return 'warn'
}

const shouldLog = (level) => {
  const currentLevel = LOG_LEVELS[getLogLevel()] ?? LOG_LEVELS.debug
  return LOG_LEVELS[level] <= currentLevel
}

export const logger = {
  debug: (...args) => { if (shouldLog('debug')) console.debug(...args) },
  info: (...args) => { if (shouldLog('info')) console.info(...args) },
  warn: (...args) => { if (shouldLog('warn')) console.warn(...args) },
  error: (...args) => { if (shouldLog('error')) console.error(...args) }
}
