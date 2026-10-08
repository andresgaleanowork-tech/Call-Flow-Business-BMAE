/**
 * honesto.js — F3 · SELLO HONESTO (ley C10 §3, decisión F23 del usuario).
 * Toda cifra derivada de consumo pasa por aquí: es IMPOSIBLE pintar el valor
 * sin declarar cuántos meses son reales y cuántos estimados.
 */

export function sello({ mesesReales, mesesEstimados }) {
  const total = mesesReales + mesesEstimados;
  return {
    mesesReales,
    mesesEstimados,
    total,
    completo: mesesReales >= total, // total sin estimar → sello "completo"
    texto: mesesEstimados > 0
      ? `${mesesReales} meses reales + ${mesesEstimados} estimados`
      : `${mesesReales} meses reales`,
    aria: mesesEstimados > 0
      ? `Cálculo con ${mesesReales} meses de factura reales y ${mesesEstimados} estimados por estacionalidad`
      : `Cálculo con ${mesesReales} meses reales de factura`,
  };
}

/** Chip visual del sello (reusa los estilos del diseño: borde ámbar + texto oscuro ✓D-C8). */
export function chipSello(datosSello) {
  const s = sello(datosSello);
  const el = document.createElement("span");
  el.className = "app-sello";
  el.setAttribute("role", "status");
  el.setAttribute("aria-label", s.aria);
  if (s.completo) el.classList.add("app-sello--completo");
  el.textContent = `${s.completo ? "✓ " : ""}${s.texto}`;
  return el;
}

/** Formato moneda es-ES (regla C11 §2.4: nunca concatenar "€" a mano). */
const _eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const eur = (n) => _eur.format(n);

const _num = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });
export const num = (n) => _num.format(n);

const _fecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });
export const fecha = (d) => _fecha.format(d instanceof Date ? d : new Date(d));
