# Tres Sabuesos 🔎

Expedientes de homicidio para exactamente 3 personas: deducción, interrogatorio y bastante teatro. Cada una entra al mismo caso desde su celular y ve información que las otras no.

Cada caso se arma con un escenario cerrado (una casona, una cabaña en la nieve, un edificio a oscuras, unas oficinas, un hotel de ruta o un teatro), una víctima con su historia, sospechosos con nacionalidad, acento, carácter y trasfondo, y un conjunto de objetos entre los que está el arma.

## Modos

### 🎭 Culpable entre nosotros (códigos como `MC-4821`)

Un detective y dos sospechosos. Uno de los sospechosos es inocente y el otro culpable; cada uno se entera al entrar.

- **Detective**: tiene evidencia propia, interroga y dispone de 2 órdenes de registro. Con una orden obliga a un sospechoso a mostrar en pantalla una pista que le dijo: si la muestra, es verdadera; si no puede, la inventó. Tiene una sola acusación.
- **Inocente**: no puede mentir sobre dónde estuvo, qué llevaba ni qué vio. Tiene que convencer al detective.
- **Culpable**: recibe una coartada sugerida (dónde decir que estuvo y qué pista inventar) y puede mentir en todo.

Si el detective acierta, gana con el inocente. Si acusa al inocente, gana el culpable.

La coartada no choca con la evidencia del detective, así que no se cae sola. Pero siempre hay una o dos pistas del inocente que, una vez verificadas, la vuelven imposible.

### 🤝 En equipo (códigos como `M-4821`)

Los tres investigan juntos. Detective, Forense y Periodista tienen pistas distintas y ningún par puede resolver el caso sin el tercero. Hay 2 acusaciones.

## En los dos modos

- Cada jugador recibe una **ficha personal**: origen y acento para imitar, carácter, muletilla y trasfondo.
- **Tu guion** trae frases para cada ronda, armadas con los datos del caso.
- Cada jugador tiene una **misión secreta** de actuación.
- La pestaña **Caso** trae una guía ronda por ronda.
- Prohibido mostrar la pantalla, salvo cuando el juego lo pide.
- Con un solo celular también funciona: se pasa de mano en mano con «Cambiar papel».

## Cómo funciona

No hay servidor. El código del caso es la semilla de un generador determinista, así que los tres dispositivos arman exactamente el mismo misterio.

- `engine.js`: generador de casos, coartadas y textos de las pistas.
- `app.js`: pantallas, notas y acusación (el progreso se guarda en `localStorage`).
- `style.css`, `index.html`: interfaz.

## Publicar en GitHub Pages

En el repositorio: **Settings → Pages → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.

## Probar en local

```bash
python -m http.server 8123
```

Y abrir `http://localhost:8123`.
