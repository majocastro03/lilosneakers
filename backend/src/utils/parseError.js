/**
 * Traduce errores de Supabase/Postgres a mensajes amigables en español.
 * @param {object} err - El error capturado
 * @param {string} defaultMsg - Mensaje genérico por defecto
 * @returns {{ status: number, message: string }}
 */
function parseError(err, defaultMsg = 'Error interno del servidor') {
  const code = err.code;

  if (code === '23505') {
    // unique_violation
    const match = err.details?.match(/Key \((.+?)\)=\((.+?)\) already exists/);
    if (match) {
      const campos = match[1].replace(/, /g, ' + ');
      return { status: 409, message: `Ya existe un registro con ese ${campos} (${match[2]})` };
    }
    return { status: 409, message: 'Ya existe un registro con esos datos' };
  }

  if (code === '23503') {
    // foreign_key_violation
    if (err.details?.includes('is still referenced')) {
      return { status: 409, message: 'No se puede eliminar porque tiene registros asociados' };
    }
    return { status: 400, message: 'Referencia inválida: el registro relacionado no existe' };
  }

  if (code === '23502') {
    // not_null_violation
    const match = err.message?.match(/column "(.+?)"/);
    const campo = match ? match[1] : 'campo';
    return { status: 400, message: `El campo "${campo}" es obligatorio` };
  }

  if (code === '23514') {
    // check_violation
    return { status: 400, message: 'Los datos no cumplen las restricciones de validación' };
  }

  return { status: 500, message: defaultMsg };
}

module.exports = parseError;
