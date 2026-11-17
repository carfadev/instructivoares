// Consulta y borrado de resultados para la página de administración (admin.html).
// Clave del panel de administración. Para cambiarla, edite esta línea (o defina ADMIN_CLAVE en Vercel, que tiene prioridad).
// Mantenga el repositorio PRIVADO, porque la clave queda escrita aquí.
const CLAVE_PANEL = '103987';
const { redis, KEY, sinBase } = require('./_redis');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const clave = process.env.ADMIN_CLAVE || CLAVE_PANEL;
  if (req.headers['x-clave'] !== clave) return res.status(401).json({ ok: false, error: 'Clave incorrecta' });
  try {
    const lista = (await redis('LRANGE', KEY, 0, -1)) || [];
    if (req.method === 'GET') {
      const resultados = lista.map((s) => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean);
      return res.status(200).json({ ok: true, resultados });
    }
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || '');
      const s = lista.find((x) => { try { return JSON.parse(x).id === id; } catch (e) { return false; } });
      if (!s) return res.status(404).json({ ok: false, error: 'Registro no encontrado' });
      await redis('LREM', KEY, 1, s);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  } catch (e) {
    if (e.message === 'SIN_BASE') return res.status(503).json({ ok: false, error: sinBase });
    return res.status(500).json({ ok: false, error: 'Error consultando la base de datos' });
  }
};
