# HTTPS local: PC y celular

Esta guía permite abrir la aplicación local con HTTPS sin la advertencia de
"conexión no segura".

## En la PC (una sola vez)

1. Instalar [mkcert](https://github.com/FiloSottile/mkcert):

   ```powershell
   winget install --id FiloSottile.mkcert -e
   ```

2. Dentro de la carpeta del proyecto, crear y confiar la CA local:

   ```powershell
   cd C:\Users\ASUS\Project\webstore
   mkdir .certs
   mkcert -install
   ```

3. Crear el certificado para la PC y el celular. Sustituye la IP si cambia:

   ```powershell
   mkcert -key-file .certs\localhost-key.pem -cert-file .certs\localhost-cert.pem localhost 127.0.0.1 ::1 192.168.18.211
   ```

4. Iniciar normalmente:

   ```powershell
   npm run dev
   ```

El script `npm run dev` ya está configurado para usar los certificados de
`.certs`. La carpeta está ignorada por Git porque contiene una clave privada.

## Direcciones de acceso

| Dispositivo | Dirección |
| --- | --- |
| PC | `https://localhost:3000` |
| Celular en la misma red Wi-Fi | `https://192.168.18.211:3000` |

La IP de la PC puede cambiar si el router usa DHCP. Si cambia, genera otro
certificado con la IP nueva o reserva una IP fija para la PC en el router.

## Confiar en el certificado desde un Galaxy S23

1. En la PC, ejecutar:

   ```powershell
   mkcert -CAROOT
   ```

2. Copiar al celular **solo** el archivo `rootCA.pem` de esa carpeta.
3. En el S23 ir a:

   ```text
   Ajustes → Seguridad y privacidad → Más ajustes de seguridad
   → Instalar desde almacenamiento del dispositivo → Certificado CA
   ```

4. Instalar `rootCA.pem` y confirmar con el PIN.
5. Cerrar y abrir Chrome/Brave, y visitar la URL HTTPS del celular.

En certificados de usuario debe aparecer `mkcert development ca`.

## Seguridad

- Nunca copies, compartas o subas a Git `rootCA-key.pem` ni
  `.certs\localhost-key.pem`.
- No instales `localhost-cert.pem` en el celular; ese archivo solo lo usa
  Next.js en la PC.
- Instala `rootCA.pem` únicamente en dispositivos propios usados para
  desarrollo local.
- Para iniciar temporalmente sin HTTPS: `npm run dev:http`.
