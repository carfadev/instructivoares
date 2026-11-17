// Conexión con la base de datos Redis que se crea desde el panel de Vercel (Storage → Upstash for Redis).
// Vercel agrega solas las variables KV_REST_API_URL y KV_REST_API_TOKEN (o UPSTASH_REDIS_REST_URL / _TOKEN).
const URL_DB = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_DB = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'ares:resultados';

async function redis(...cmd) {
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
