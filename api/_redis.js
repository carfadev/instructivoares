// Conexión compatible con REDIS_URL (redis:// o rediss://) y con las variables REST de Upstash.
const REDIS_URL = process.env.REDIS_URL;
const URL_DB = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_DB = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'ares:resultados';

let clienteRedis;

function getRedisClient() {
  if (!clienteRedis) {
    const Redis = require('ioredis');
    clienteRedis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableReadyCheck: true,
    });
  }
  return clienteRedis;
}

async function redis(...cmd) {
  if (REDIS_URL) {
    const cliente = getRedisClient();
    if (cliente.status === 'wait') await cliente.connect();
    return cliente.call(...cmd.map(String));
  }
  if (!URL_DB || !TOKEN_DB) throw new Error('SIN_BASE');
  const r = await fetch(URL_DB, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN_DB, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd.map(String)),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const sinBase = 'La base de datos no está conectada en Vercel (Storage → Upstash for Redis).';
module.exports = { redis, KEY, sinBase };
