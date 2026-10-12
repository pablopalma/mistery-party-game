# Tres Sabuesos 🔎

Juego cooperativo de misterio para exactamente 3 personas. Cada una entra al mismo caso desde su celular y recibe pistas que las otras no ven; solo hablando entre las tres se puede deducir quién fue.

## Cómo se juega

1. Una crea un caso (Fácil, Medio o Difícil) y comparte el código o el enlace.
2. Cada una elige un rol distinto:
   - 🕵️ **Detective**: sabe quién estuvo en cada lugar.
   - 🔬 **Forense**: sabe qué objeto pasó por cada lugar.
   - 📰 **Periodista**: sabe quién llevaba cada objeto.
3. Prohibido mostrar la pantalla: las pistas se dicen en voz alta.
4. Entre las tres deducen al culpable y el objeto que llevaba. Hay 2 acusaciones.

Con un solo celular también funciona: se pasa de mano en mano con "Cambiar rol".

## Cómo funciona

No hay servidor. El código del caso es la semilla de un generador determinista, así que los tres dispositivos arman exactamente el mismo misterio. Cada caso tiene solución única y está verificado para que ningún par de roles pueda resolverlo sin el tercero.

- `engine.js`: generador de casos y textos de las pistas.
- `app.js`: pantallas, notas y acusación (el progreso se guarda en `localStorage`).
- `style.css`, `index.html`: interfaz.

## Publicar en GitHub Pages

1. Subir estos archivos a un repositorio público de GitHub.
2. En el repositorio: **Settings → Pages → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En un minuto queda en `https://USUARIO.github.io/REPOSITORIO/`.

## Probar en local

```bash
python -m http.server 8123
```

Y abrir `http://localhost:8123`.
