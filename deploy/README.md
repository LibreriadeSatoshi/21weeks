# Deploying on AWS Lightsail

The app is published at `ismos.xyz/21weeks`. The Astro site on Netlify proxies that path to a Lightsail server (`app.ismos.xyz`), where the app, MySQL and Caddy run with Docker Compose.

```
browser ──► ismos.xyz/21weeks/*  (Netlify, proxy) ──► app.ismos.xyz/21weeks/*  (pages and assets)
browser ──────────────────────────────────────────► app.ismos.xyz/21weeks/api/* (API, with CORS)
```

The browser calls the API directly on the server because the Netlify proxy cuts requests off at 26 s, and the mentor chat (streaming) or the AI issue ranking can take longer than that.

## 1. Server

1. In Lightsail, create a **Linux, Debian 13** instance on the **2 GB RAM** plan (the image build does not fit in less) in an EU region (e.g. Frankfurt or Paris).
2. **Networking**: create a static IP and attach it. In the firewall, leave only 22 (SSH), 80 and 443 open.
3. **DNS**: an `A` record for `app.ismos.xyz` pointing to that IP. Caddy requests the HTTPS certificate on its own as soon as DNS resolves.
4. Log in over SSH (user `admin` on Debian) and prepare the machine:

   ```bash
   sudo apt-get update && sudo apt-get install -y curl git
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER   # log out and back in
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   git clone https://github.com/LibreriadeSatoshi/21weeks.git ~/21weeks
   ```

5. Create `~/21weeks/.env`:

   ```bash
   DOMAIN=app.ismos.xyz
   BASE_PATH=/21weeks/
   CORS_ORIGINS=https://ismos.xyz
   MYSQL_PASSWORD=<openssl rand -hex 24>
   AI_BASE_URL=<OpenAI-compatible provider>
   AI_API_KEY=<key>
   AI_MODEL_ID=<model>
   # BACKUP_S3_URI=s3://<bucket>/21weeks
   ```

   `chmod 600 ~/21weeks/.env`. Do not commit it to the repo.

6. Start it:

   ```bash
   cd ~/21weeks && docker compose -f docker-compose.prod.yml up -d --build
   curl https://app.ismos.xyz/21weeks/api/health   # {"ok":true}
   ```

## Private access until launch

With `SITE_PASSWORD` in the `.env`, the whole app (pages, JS and API) sits behind a generic password page (it does not say which site it protects), and every response carries `X-Robots-Tag: noindex, nofollow`. Only `/api/health` stays open (for deployment).

```bash
SITE_PASSWORD=<password>
COOKIE_DOMAIN=ismos.xyz   # the same cookie works on ismos.xyz/21weeks and on app.ismos.xyz
```

Apply it with `docker compose -f docker-compose.prod.yml up -d`. The cookie lasts 30 days; changing the password ends all sessions. For launch, leave `SITE_PASSWORD` empty and apply again.

## 2. Netlify (Astro site repo)

In `public/_redirects` of the ismos.xyz site:

```
/21weeks    https://app.ismos.xyz/21weeks/        200
/21weeks/*  https://app.ismos.xyz/21weeks/:splat  200
```

Or in `netlify.toml`:

```toml
[[redirects]]
  from = "/21weeks/*"
  to = "https://app.ismos.xyz/21weeks/:splat"
  status = 200
```

After the Netlify deploy, `https://ismos.xyz/21weeks/` should show the app.

## 3. Backups

Two layers, both recommended:

- **Automatic Lightsail snapshots** (the instance's _Snapshots_ tab): a daily copy of the whole disk, with nothing else to configure.
- **Daily MySQL dump** with `deploy/backup.sh`, which keeps 14 days in `~/backups` and, if you set `BACKUP_S3_URI`, uploads each copy to S3 (it needs the `aws` CLI and an IAM user with `s3:PutObject` on that bucket):

  ```bash
  crontab -e
  0 3 * * * $HOME/21weeks/deploy/backup.sh >> $HOME/backups/backup.log 2>&1
  ```

Restore: `gunzip -c <backup>.sql.gz | docker compose -f docker-compose.prod.yml exec -T -e MYSQL_PWD=<password> db mysql -u21weeks 21weeks`.

## 4. Automatic deployment from GitHub

The `deploy` job in `.github/workflows/ci.yml` runs on every push to `main` once the checks pass. It does nothing until you configure `DEPLOY_HOST`.

1. Generate a key used only for deploying and authorize it on the server:

   ```bash
   ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-deploy-21weeks"
   cat deploy_key.pub | ssh -i <lightsail-key>.pem admin@app.ismos.xyz 'cat >> ~/.ssh/authorized_keys'
   ssh-keyscan app.ismos.xyz > known_hosts
   ```

2. In GitHub, _Settings → Secrets and variables → Actions_:
   - **Secrets**: `DEPLOY_SSH_KEY` (contents of `deploy_key`) and `DEPLOY_KNOWN_HOSTS` (contents of `known_hosts`).
   - **Variables** (repository variables, not environment variables, because the job's `if` reads them before entering the environment): `DEPLOY_HOST=app.ismos.xyz`, `DEPLOY_USER=admin`, `DEPLOY_HEALTH_URL=https://app.ismos.xyz/21weeks/api/health`.
3. Delete `deploy_key` from your machine.

Each deployment runs `git reset --hard origin/main` on the server and rebuilds the image; manual changes made in `~/21weeks` (except `.env`, which is not versioned) are lost.
