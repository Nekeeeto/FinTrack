# Changelog

Todos los cambios relevantes del proyecto se documentan en este archivo.

## [2026-04-09] - Landing: modo claro, layout y sin barra inferior

### Agregado
- Interruptor de tema (sol/luna) en el header público de la landing, usando `next-themes` con persistencia en `localStorage` (`fintrack-theme`).
- Estilos de modo claro para hero (gradientes y olas), secciones de marketing, FAQ, testimonios, tienda y footer.
- `src/lib/landing-layout.ts`: `LANDING_CONTAINER` y `LANDING_SECTION_Y` / `LANDING_FOOTER_Y` para alinear `max-w-5xl`, paddings (`px-5 sm:px-6 lg:px-8`) y alturas de sección en toda la landing.

### Eliminado
- Barra fija inferior de descargas (`MobileDownloadBar`) en la home pública.

### Cambiado
- `body` del layout raíz usa `bg-background` para respetar claro/oscuro en toda la app.
- Tokens semánticos (`foreground`, `muted-foreground`, `card`, `border`) y utilidades `dark:` donde hacía falta para mantener el look oscuro actual.
- Carousel de marketing: grid de dos columnas dentro del mismo contenedor (sin `calc(50vw)`), orden en móvil (carrusel arriba), tarjetas con ancho fluido y foco visible.
- Testimonios: tarjetas con ancho máximo respecto al viewport para evitar overflow en pantallas chicas.
- Hero: CTA principal ancho completo en móvil dentro de un `max-w-lg` centrado.
- Sección tienda / mockup: hover del screenshot con clip interno, zoom más marcado (`scale-[1.12]`), brillo y overlay que cede; marco con leve elevación y sombra; respeta `prefers-reduced-motion`.

## [2026-04-08] - Asistente de voz con Groq

### Mejorado
- Parsing de números en palabras: "mil quinientos" → 1500, "doscientos cincuenta" → 250, etc.
- Mejor detección de categorías con búsqueda parcial (ej: "súper" matchea "Supermercado")
- Aliases ampliados para categorías reales del sistema (delivery, café, bar, UTE, OSE, etc.)
- Errores de Groq ahora muestran el detalle real para debug
- Manejo correcto del formato de audio según MIME type del navegador

### Agregado
- Botón flotante de micrófono (violeta) visible en todas las pantallas de la app
- Modal de asistente de voz con grabación de audio
- Integración con Groq API (Whisper large-v3-turbo) para transcripción de audio en español
- API route `/api/audio/transcribe` para procesar audio
- Parsing inteligente de texto para detectar: tipo (gasto/ingreso), monto, categoría, cuenta y moneda
- Aliases de categorías comunes (super, uber, netflix, etc.)
- Detección de moneda por palabras clave (dólares, pesos, reales)
- Respuestas controladas: si el audio no se entiende o pide algo no soportado, muestra mensaje claro
- Feedback visual: estados de grabación, procesamiento, éxito y error
- Confirmación antes de crear la transacción (muestra datos detectados)
- Variable de entorno `GROQ_API_KEY`
