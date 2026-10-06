# ADR-003 · Doble clave: datos vs acceso (S1, infraestructura)

**Fecha:** 05-10-2026 · **Estado:** Aceptada · Ola 1(a) · v3.10.0 (solo infrastructura; uso incremental por módulos)

## Contexto
Hoy la clave real (token GitHub) se cifra con la contraseña y viaja al dispositivo de cada usuario. Si algún dispositivo se compromete o el token llega a un log, el token tiene `contents:write` y **todo dato escrito queda legible**. Vemos necesario que el token no sea también «la llave de los datos».

## Decisión
El payload cifrado del blob (ADR-002) deja de ser solo el token y pasa a ser **JSON `{k:token, dk:dataKey}`**; la `dk` es una clave AES-256 generada una vez por el admin (la guardan todos los dispositivos tras descifrar, junto al token: `cfb_data_key`).

- Compat: payload texto plano (legacy) sigue descifrando; `dk=null` → módulos sin cifrado selectivo.
- Uso **incremental**: cada módulo nuevo (F1 fichas ricas con notas/valores, F2, F9/F15…) define QUÉ campos se cifran con la `dk` antes de sincronizar (`cfbCifraDato`/`cfbDescifraDato` genéricos). Lo existente no se re-cifra en esta ola.
- En repos PÚBLICOS no se persiste nada nuevo; la `dk` viaja solo cifrada dentro del blob (y en localStorage del dispositivo autorizado).

## Alternativas
- Cifrar colecciones enteras: imposible sin romper la lectura por Pages y la búsqueda.
- Una clave por usuario por colección: complejidad no justificada (revisar al migrar BBDD).

## Consecuencias
- Filtrado del token ≠ filtrado de dato gordo: el dato sensible queda ilegible si el repo es público o el token se pierde.
- Rotación de `dk` = re-cifrar campos afectados: procedimiento documentado en ROTACION-CLAVE.md al aplicarse; de momento la `dk` solo rota si hay incidente.
- Ojo LS: que exista `cfb_data_key` en localStorage es equivalente, en exposición, a que exista allí el token: no empeora el estado actual.
