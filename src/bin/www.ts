

import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import debugLib from 'debug';
import http from 'http';

const debug = debugLib('mi-proyecto:server');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3003');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr as any)?.port;
  
  // Obtener el puerto de manera segura
  const serverPort = typeof addr === 'string' ? addr : (addr as any)?.port || port;
  
  // Log detallado para el usuario
  console.log('\n' + '='.repeat(60));
  console.log('🐾 PATITAS MÓVILES - SERVIDOR INICIADO');
  console.log('='.repeat(60));
  console.log(`🚀 Servidor funcionando en: http://localhost:${serverPort}`);
  console.log(`📱 Puerto: ${serverPort}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email: info@patitasmoviles.com`);
  console.log(`📞 Teléfono: +58 424-123-4567`);
  console.log('='.repeat(60));
  console.log('💡 Presiona Ctrl+C para detener el servidor');
  console.log('='.repeat(60) + '\n');
  
  // Log original para debug
  debug('Listening on ' + bind);
}
