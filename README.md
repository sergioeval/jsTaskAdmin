# Local Workspace (Vanilla JS + Docker)

## Ejecutar

```bash
docker compose up --build
```

Abrí `http://localhost:8080`.

## Archivos

- `index.html`: login por número + workspace
- `styles.css`: estilos
- `app.js`: guarda workspace local (localStorage) + export/import JSON
- `Dockerfile`: sirve estáticos con Nginx
- `docker-compose.yml`: levanta el contenedor en el puerto 8080

## Persistencia

- El “workspace” se guarda en el navegador usando `localStorage` por `userNumber`.
- Para respaldar/restaurar, usá **Exportar JSON** y **Importar JSON**.
