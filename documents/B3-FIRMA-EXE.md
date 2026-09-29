# B3 · Firma del EXE — estado, qué se hizo y cómo pasar a firma REAL

**Fecha:** 15‑09‑2026 · **Versión:** v1.5.3 · **Estado:** ✅ ejecutada con certificado **DEMO autofirmado** (proceso 100 % idéntico al de un certificado real comprado).

## 1 · Qué se hizo

1. Certificado de firma de código **RSA‑3072** (uso `codeSigning`), válido 2 años,
   guardado en `WINDOWS/firma/demo.pfx` (contraseña: `cfbdemo`) con su `.crt`/`.key`.
2. Firma del instalador portable con **osslsigncode** + **sello de tiempo RFC‑3161 de DigiCert**
   (el sello de tiempo hace que la firma siga siendo válida aunque el certificado caduque).
3. Verificación criptográfica: la firma es íntegra — el «message digest» calculado coincide.
4. Resumen de archivo en `WINDOWS/firma/VERBOSE-verificacion.txt` y SHA‑256 de ambos EXE en `WINDOWS/SHA256.txt`.

## 2 · Qué gana la app ya

| | EXE sin firmar | EXE firmado (DEMO) |
|---|---|---|
| Detectar si el archivo fue **alterado** tras compilarlo | ❌ | ✅ (la firma deja de ser válida) |
| Nombre e intención visibles al usuario («Call Flow Business») | ❌ | ✅ |
| Ejecutable con sello de fecha/hora | ❌ | ✅ (RFC‑3161 DigiCert) |

## 3 · Límite honesto del certificado DEMO

- Windows SmartScreen y antivirus **seguirán mostrando aviso** («editor desconocido»), porque la cadena del certificado no parte de una CA de confianza.
- Para quitar ese aviso hace falta un **certificado real** de Autenticación de Código:
  - **OV** (organización verificada, ~70–150 €/año) — quita SmartScreen después de acumular reputación.
  - **EV** (token USB/HSM, ~250–400 €/año) — reputación **inmediata** en SmartScreen.

## 4 · Receta reproducible (misma para el certificado real)

```bash
# crear DEMO (estro semana solo la primera vez)
openssl req -x509 -newkey rsa:3072 -keyout demo.key -out demo.crt -days 730 -nodes -batch \
  -subj "/CN=BusyMe Call Flow Business (DEMO autofirmado)/O=BusyMe/C=ES" \
  -addext "extendedKeyUsage=codeSigning" -addext "keyUsage=digitalSignature"
openssl pkcs12 -export -out demo.pfx -inkey demo.key -in demo.crt -passout pass:cfbdemo

# firmar (sustituir demo.pfx por el .pfx real cuando se compre)
osslsigncode sign -pkcs12 demo.pfx -pass cfbdemo -n "Call Flow Business" \
  -i "https://github.com/andresgaleanowork-tech" -t http://timestamp.digicert.com \
  -in Call-Flow-Business.exe -out Call-Flow-Business-firmado.exe

# verificar SIEMPRE tras firmar (el "Calculated message digest" debe coincidir)
osslsigncode verify -in Call-Flow-Business-firmado.exe
```

> En un Windows con **signtool** (SDK), el equivalente es:
> `signtool sign /fd sha256 /f certificado.pfx /p CLAVE /tr http://timestamp.digicert.com /td sha256 Call-Flow-Business.exe`

## 5 · Normativa de custodia

- `demo.pfx` (y el real cuando exista) vive **solo** en `WINDOWS/firma/` — nunca en `WEB/` ni en Git.
- La contraseña del `.pfx` real se guarda en un gestor de contraseñas, no en este repo.
