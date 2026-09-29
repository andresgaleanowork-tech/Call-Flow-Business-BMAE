# 🚀 Despliegue a GitHub Pages (mejora #1)

El sitio publicable vive íntegro en `apps/web/`. Repositorio: `andresgaleanowork-tech/Call-Flow-Business-BMAE` · URL: https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/

## Camino rápido (un push)
```bash
cd apps/web
git init            # solo la 1ª vez
git remote add origin https://github.com/andresgaleanowork-tech/Call-Flow-Business-BMAE.git
git add -A && git commit -m "v2.8.0 — portada de marca + 10 mejoras"
git push -u origin main            # o la rama que sirva Pages
```
GitHub Pages (Settings → Pages) debe apuntar a la raíz del repo (o `/docs` si se mueve); `index.html` está en la raíz de `apps/web/`.

## Verificación post-deploy (30 s)
1. Abrir la URL → hero Iberdrola × B&M visible.
2. En el modo código, buscar `qnTel` → 1 resultado.
3. `sw cfb-v280` activo (DevTools → Application → Service Workers).

> La CI (`.github/workflows/build.yml`) corre la batería y empaqueta binarios en cada push.
