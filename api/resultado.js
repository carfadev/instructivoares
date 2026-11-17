// Recibe el resultado de una evaluación y lo guarda. Lo llama la capacitación (index.html) al terminar.
const { redis, KEY, sinBase } = require('./_redis');
const txt = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const num = (v) => (Number.isFinite(+v) ? +v : 0);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });
  try {
    let d = req.body;
    if (typeof d === 'string') d = JSON.parse(d || '{}');
    const cedula = txt(d && d.cedula, 15).replace(/\D/g, '');
    if (!d || txt(d.nombre, 80).length < 5 || !/^\d{5,11}$/.test(cedula)) {
      return res.status(400).json({ ok: false, error: 'Datos del participante incompletos' });
    }
    const respuestas = (Array.isArray(d.respuestas) ? d.respuestas : []).slice(0, 50).map((r) => ({
      n: num(r.n), pregunta: txt(r.pregunta, 300), elegida: txt(r.elegida, 300), correcta: r.correcta === true,
    }));
    const reg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      recibido: new Date().toISOString(),
      fecha: txt(d.fecha, 40), nombre: txt(d.nombre, 80), cedula,
      sede: txt(d.sede, 60), cargo: txt(d.cargo, 60), turno: txt(d.turno, 40),
      intento: num(d.intento) || 1, puntaje: num(d.puntaje), total: num(d.total) || respuestas.length,
      porcentaje: num(d.porcentaje), resultado: txt(d.resultado, 20), duracionSeg: num(d.duracionSeg),
      respuestas,
    };
    await redis('RPUSH', KEY, JSON.stringify(reg));
    return res.status(200).json({ ok: true, id: reg.id });
  } catch (e) {
    if (e.message === 'SIN_BASE') return res.status(503).json({ ok: false, error: sinBase });
    return res.status(500).json({ ok: false, error: 'No se pudo guardar el resultado' });
  }
};
