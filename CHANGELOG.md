# Changelog

Todos los cambios relevantes del proyecto se documentan en este archivo.

## [2026-04-08] - Asistente de voz con Groq

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
