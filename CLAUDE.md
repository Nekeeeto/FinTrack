# FinTrack — Gestor Financiero Personal

## Stack
- Next.js 14 (App Router, TypeScript estricto)
- Supabase (PostgreSQL + Auth)
- Tailwind CSS + shadcn/ui
- Anthropic API (modelo: claude-opus-4-6) para OCR de tickets
- Telegram Bot API para recibir fotos
- Vercel para deploy
- Recharts para gráficos
- Zod para validaciones

## Estructura de carpetas
```
/app              → rutas Next.js (layout, pages, /api/...)
/components       → componentes reutilizables
/lib              → supabase client, utils, validaciones
/lib/supabase     → client.ts (browser) y server.ts (SSR)
/hooks            → custom hooks
/types            → interfaces TypeScript globales
/supabase         → schema.sql y README
```

## Base de datos (Supabase)
Tablas principales: accounts, categories, transactions
RLS habilitado — cada usuario solo ve sus propios datos
Seed inicial: 4 cuentas (GENERAL, PYRO.UY, CASA MIGUEL, DÓLARES) + 9 categorías en español rioplatense

## Cuentas del negocio
- GENERAL → negro (#1a1a1a) → UYU → uso personal
- PYRO.UY → azul (#1e3a8a) → UYU → negocio pirotecnia
- CASA MIGUEL → rojo (#dc2626) → UYU → negocio cotillón
- DÓLARES → verde (#16a34a) → USD → ahorros en dólares

## Lo que ya está hecho (actualizar a medida que avanza)
- [ ] Scaffold Next.js 14
- [ ] Schema SQL en Supabase
- [ ] Supabase Auth (magic link)
- [ ] CRUD /api/transactions
- [ ] CRUD /api/accounts
- [ ] CRUD /api/categories
- [ ] Bot de Telegram + OCR
- [ ] Dashboard principal
- [ ] Pantalla de transacciones
- [ ] Asistente de voz (Groq Whisper) — botón flotante global

## Variables de entorno necesarias
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
GROQ_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL

## Convenciones de código
- Comentarios y commits en español
- Validar siempre con Zod en API routes
- Server Components por defecto, Client Components solo cuando sea necesario (forms, interactividad)
- Manejar errores en todas las API routes (try/catch + respuesta JSON con error)
- Tipos TypeScript en /types/database.ts — nunca usar `any`

## Convenciones de respuesta (IMPORTANTE)
- No explicar el código línea por línea
- Al terminar cada tarea: listar archivos creados/modificados y por qué
- Si hay un error de build o lint, corregirlo antes de reportar que terminaste
- Hacer commit al terminar cada tarea con mensaje descriptivo en español
- **SIEMPRE actualizar CHANGELOG.md** antes de cada push con los cambios realizados

## Comandos útiles
```bash
npm run dev       # servidor de desarrollo en localhost:3000
npm run build     # verificar que compila sin errores
npm run lint      # verificar código
```

## Deploy
- **URL producción:** https://fin-track-alpha-seven.vercel.app/
- **Webhook Telegram:** https://fin-track-alpha-seven.vercel.app/api/telegram/webhook
- **Bot Telegram:** @biyuyauy_bot

## Fase actual
Fase 2 — Bot de Telegram + OCR (completada)
Ver roadmap completo en README.md
