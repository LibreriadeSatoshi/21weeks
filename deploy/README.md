# Despliegue en AWS Lightsail

La app se publica en `ismos.xyz/21weeks`. La web Astro de Netlify hace de proxy de esa ruta hacia un servidor Lightsail (`app.ismos.xyz`), donde corren la app, MySQL y Caddy con Docker Compose.

```
navegador ──► ismos.xyz/21weeks/*  (Netlify, proxy) ──► app.ismos.xyz/21weeks/*  (páginas y assets)
navegador ──────────────────────────────────────────► app.ismos.xyz/21weeks/api/* (API, con CORS)
```

La API se llama directamente al servidor porque el proxy de Netlify corta las peticiones a los 26 s, y el chat del mentor (streaming) o el ranking de issues con IA pueden pasar de ahí.

## 1. Servidor

1. En Lightsail, crea una instancia **Linux, Debian 13**, plan de **2 GB de RAM** (el build de la imagen no cabe con menos) en una región de la UE (p. ej. Fráncfort o París).
2. **Networking**: crea una IP estática y asígnala. En el firewall deja abiertos solo 22 (SSH), 80 y 443.
3. **DNS**: registro `A` de `app.ismos.xyz` apuntando a esa IP. Caddy pide el certificado HTTPS solo, en cuanto el DNS resuelve.
4. Entra por SSH (usuario `admin` en Debian) y prepara la máquina:

   ```bash
   sudo apt-get update && sudo apt-get install -y curl git
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER   # sal y vuelve a entrar
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   git clone https://github.com/LibreriadeSatoshi/21weeks.git ~/21weeks
   ```

5. Crea `~/21weeks/.env`:

   ```bash
   DOMAIN=app.ismos.xyz
   BASE_PATH=/21weeks/
   CORS_ORIGINS=https://ismos.xyz
   MYSQL_PASSWORD=<openssl rand -hex 24>
   AI_BASE_URL=<proveedor compatible con OpenAI>
   AI_API_KEY=<clave>
   AI_MODEL_ID=<modelo>
   # BACKUP_S3_URI=s3://<bucket>/21weeks
   ```

   `chmod 600 ~/21weeks/.env`. No lo subas al repo.

6. Arranca:

   ```bash
   cd ~/21weeks && docker compose -f docker-compose.prod.yml up -d --build
   curl https://app.ismos.xyz/21weeks/api/health   # {"ok":true}
   ```

## 2. Netlify (repo de la web Astro)

En `public/_redirects` de la web de ismos.xyz:

```
/21weeks    https://app.ismos.xyz/21weeks/        200
/21weeks/*  https://app.ismos.xyz/21weeks/:splat  200
```

O en `netlify.toml`:

```toml
[[redirects]]
  from = "/21weeks/*"
  to = "https://app.ismos.xyz/21weeks/:splat"
  status = 200
```

Después del deploy de Netlify, `https://ismos.xyz/21weeks/` debe mostrar la app.

## 3. Copias de seguridad

Dos capas, recomendadas las dos:

- **Snapshots automáticos de Lightsail** (pestaña _Snapshots_ de la instancia): copia diaria de todo el disco, sin configurar nada más.
- **Volcado diario de MySQL** con `deploy/backup.sh`, que guarda 14 días en `~/backups` y, si defines `BACKUP_S3_URI`, sube cada copia a S3 (necesita `aws` CLI y un usuario IAM con `s3:PutObject` sobre ese bucket):

  ```bash
  crontab -e
  0 3 * * * $HOME/21weeks/deploy/backup.sh >> $HOME/backups/backup.log 2>&1
  ```

Restaurar: `gunzip -c <copia>.sql.gz | docker compose -f docker-compose.prod.yml exec -T -e MYSQL_PWD=<password> db mysql -u21weeks 21weeks`.

## 4. Despliegue automático desde GitHub

El job `deploy` de `.github/workflows/ci.yml` se ejecuta en cada push a `main` cuando la verificación pasa. Hasta que configures `DEPLOY_HOST` no hace nada.

1. Genera una clave solo para desplegar y autorízala en el servidor:

   ```bash
   ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-deploy-21weeks"
   cat deploy_key.pub | ssh -i <clave-de-lightsail>.pem admin@app.ismos.xyz 'cat >> ~/.ssh/authorized_keys'
   ssh-keyscan app.ismos.xyz > known_hosts
   ```

2. En GitHub, _Settings → Secrets and variables → Actions_:
   - **Secrets**: `DEPLOY_SSH_KEY` (contenido de `deploy_key`) y `DEPLOY_KNOWN_HOSTS` (contenido de `known_hosts`).
   - **Variables** (de repositorio, no de entorno, porque el `if` del job las lee antes de entrar al entorno): `DEPLOY_HOST=app.ismos.xyz`, `DEPLOY_USER=admin`, `DEPLOY_HEALTH_URL=https://app.ismos.xyz/21weeks/api/health`.
3. Borra `deploy_key` de tu máquina.

Cada despliegue hace `git reset --hard origin/main` en el servidor y reconstruye la imagen; los cambios hechos a mano en `~/21weeks` (salvo `.env`, que no está versionado) se pierden.
