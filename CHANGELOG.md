# Changelog

Todos los cambios relevantes del proyecto se documentan en este archivo.

## [2026-04-09] - Acciones rápidas (FAB): anclaje, tamaño y orden

### Cambiado
- `Sidebar`: contenedor `flex flex-col items-end` para que el botón flotante siga pegado a la derecha al abrir el panel (antes el ancho del panel empujaba el FAB hacia la izquierda); panel y tipografía un poco más compactos; FAB e ícono «+» reducidos; filas del menú con ícono a la izquierda; entradas «Próximamente» al final de la lista.
- `Sidebar` (menú FAB): `justify-start` y `text-left` en cada fila para anular el centrado por defecto de `<button>` (la primera fila es `<Link>` y se veía distinta); celda fija 8×8 para alinear íconos; SVG de fila un poco más chico.

## [2026-04-09] - Admin: costo modelo (model_usage) usa cost_usd

### Corregido
- `GET /api/admin/users` y `GET|PATCH /api/admin/users/[id]`: el costo se agregaba con la columna inexistente `cost`; en la base el campo es `cost_usd` (como en `trackUsage` y `/api/settings/model-usage`). El panel mostraba 0 aunque hubiera uso. El listado de usuarios ahora hace una sola lectura de `model_usage` y reparte totales por `user_id`.

## [2026-04-09] - Admin: edición completa de usuarios

### Agregado
- `PATCH /api/admin/users/[id]`: admite email (sync con Auth), contraseña (`auth.admin.updateUserById`), onboarding completado, contador de fotos del mes; validación de email duplicado; no permite quitarse el rol admin a uno mismo ni dejar el sistema sin administradores.
- `/admin/usuarios/[id]`: formulario «Editar usuario» (nombre, email, rol, plan, fotos/mes, onboarding, contraseña opcional) más mensaje de éxito; columna «Acciones → Editar» en `/admin` y `/admin/usuarios`.

### Corregido
- `FeatureIllustrations.tsx`: eliminado atributo `transformOrigin` en `animateTransform` (no está en los tipos de React para SVG) para que `npm run build` pase el chequeo de TypeScript.

## [2026-04-09] - Soporte público /soporte y footer

### Agregado
- `src/app/(public)/soporte/page.tsx`: landing pública de ayuda (esbozo) con bloques Documentación, Changelog y Asistencia/tickets; metadatos y anclas `#documentacion`, `#changelog`, `#asistencia`. La ruta es `/soporte` para no chocar con `/ayuda` del panel (usuarios logueados).

### Cambiado
- `MarketingFooter`: enlace «Ayuda» a `/soporte`; eliminado el texto «Redes y contacto público: próximamente».
- `PublicStickyHeader`: enlace «Ayuda» a `/soporte` en la navegación desktop.
- `src/lib/supabase/middleware.ts`: `/soporte` accesible sin sesión.
- `src/app/sitemap.ts`: entrada `/soporte`.

## [2026-04-09] - Landing: mejorar animación en StoreSection

### Cambiado
- `src/components/StoreSection.tsx`: se cambió la animación de la imagen de la tienda. En lugar de hacer un zoom interno (`scale-[1.12]`) que daba la sensación de estar "hacia adentro", ahora la tarjeta completa se eleva y escala ligeramente hacia afuera (`hover:-translate-y-2 hover:scale-[1.02]`), logrando un efecto 3D más natural y agradable.

## [2026-04-09] - Landing: eliminar sección de testimonios

### Eliminado
- `src/components/TestimonialsCarousel.tsx`: se eliminó el componente y su uso en la landing page (`src/app/(public)/page.tsx`) a pedido del usuario.

## [2026-04-09] - Middleware: páginas legales públicas

### Cambiado
- `src/lib/supabase/middleware.ts`: `/privacidad` y `/terminos` accesibles sin login (enlaces del footer de la landing).

## [2026-04-09] - Auth: registro público, OAuth social y perfil automático

### Agregado
- `src/lib/auth/ensure-user-profile.ts`: crea `user_profiles` automáticamente en el primer login (OAuth, signUp, magic link) con service role. Idempotente.
- `src/components/auth/SocialLoginButtons.tsx`: botones OAuth (Google, Facebook, Apple) condicionados por variables de entorno `NEXT_PUBLIC_OAUTH_*`. Solo se muestran si el proveedor está habilitado.
- `src/app/registro/page.tsx`: página de registro con email + contraseña + confirmación. Mismo look glassmorphism que login. Muestra mensaje de confirmación por email.
- Enlace "¿No tenés cuenta? Creá una gratis" en login y "¿Ya tenés cuenta? Iniciá sesión" en registro.
- `/registro` en sitemap.

### Cambiado
- `src/app/auth/callback/route.ts`: ya no rechaza usuarios sin perfil (`no-profile`). Llama a `ensureUserProfile` para crear la fila, y luego redirige a `/onboarding` si falta completar o a `/inicio` si ya está listo. Cookies fijadas correctamente en el `NextResponse`.
- `src/app/login/page.tsx`: incluye `SocialLoginButtons` y link a `/registro`.
- `src/lib/supabase/middleware.ts`: `/registro` es ruta pública (misma lógica que `/login`).

## [2026-04-09] - Landing: isotipo Platita (pinch legible) y lockup solo en header

### Cambiado
- `PlatitaIsotype`: trazos en Q con puntas separadas y rombo centrado en el pinch (evita leerse como una sola onda).
- Hero público: sin lockup duplicado; marca solo en header (y footer).

### Cambiado (refinamiento visual)
- Lockup `sm`: icono `h-9 w-9`, sin escalar el SVG al 85% (evita trazos ~1px y bordes rotos).
- `PlatitaIsotype`: `viewBox` 44, `strokeWidth` 5.5, `overflow="visible"`; glow CSS más suave y sin `will-change: filter`.

## [2026-04-09] - Landing: lockup Platita (isotipo + texto) y glow animado

### Agregado
- `src/components/PlatitaIsotype.tsx`: SVG del gesto “platita” con destello en `#10b981`.
- `src/components/PlatitaBrandLockup.tsx`: isotipo + wordmark “Platita” en texto (Inter), tamaños `sm` / `md` / `lg`.
- `globals.css`: animaciones `platita-neon-dark` / `platita-neon-light` (drop-shadow tipo neon) y pulso suave del destello; respeta `prefers-reduced-motion`.

### Cambiado
- Hero de la home pública: lockup grande con reveal scroll.
- `PublicStickyHeader` y `MarketingFooter`: sustituyen el ícono `$` por el nuevo lockup (enlace a `/`).

## [2026-04-09] - SEO y copy landing Platita (Uruguay)

### Agregado
- `src/lib/site-url.ts`: URL base desde `NEXT_PUBLIC_APP_URL` con fallback a Vercel.
- `src/app/robots.ts` y `src/app/sitemap.ts`: rastreo explícito (home, login, privacidad, términos).
- `src/components/PlatitaJsonLd.tsx`: JSON-LD Organization, WebSite y SoftwareApplication.
- `src/components/MobileDownloadBar.tsx`: barra inferior en móvil con CTA a `/login` (sin enlaces falsos a tiendas).

### Cambiado
- Layout raíz: `metadataBase`, plantilla de título `%s | Platita`, Open Graph/Twitter por defecto, `lang="es-UY"`, viewport sin bloquear zoom, `appleWebApp.title` Platita.
- Home pública: metadatos (canonical, OG, Twitter), un solo `<h1>`, copy Uruguay (pesos/dólares, web/PWA), CTA a la web; apps nativas como próximamente.
- `MarketingCarousel`, `FeaturesGrid`: jerarquía h2/h3; copy alineado a web (nube, PWA, seguridad sin hiperbole “militar”).
- `TestimonialsCarousel`: rejilla de casos de uso Uruguay sin fotos ni reseñas inventadas.
- `StoreSection`: foco navegador/PWA e imagen con `next/image`.
- `FAQSection`, `PricingSection`, `MarketingFooter`, `PublicStickyHeader`: marca Platita y mensajes coherentes con el producto; footer sin enlaces sociales rotos.
- `LandingRevealWrapper`: padding inferior en móvil para la barra fija.
- `public/manifest.json`: nombre/descripción Platita y `theme_color` / `background_color` #020617.

## [2026-04-09] - Landing: hero con alcancía y tipos de gasto

### Agregado
- `HeroSpendScene`: encima del H1, lata/alcancía en SVG con animación 3D, anillos giratorios, monedas flotantes y cuatro píldoras (Delivery / Pedidos Ya, Mercado Pago, Efectivo, Dólares) con iconos genéricos — sin logotipos de terceros.

### Cambiado
- `globals.css`: keyframes `hero-can-wobble`, `hero-can-glow`, `hero-badge-float`, `hero-coin-float`, órbitas; respeto a `prefers-reduced-motion`.
- `LandingRevealWrapper`: eliminado `pb-28` reservado para barra inferior.
- Home pública: sin `MobileDownloadBar` en el hero (CTA sigue en el cuerpo de la página).

## [2026-04-09] - Landing: ilustraciones SVG en grilla de features

### Agregado
- `FeatureIllustrations.tsx`: seis ilustraciones vectoriales animadas (SMIL) alineadas a Platita (multicuenta/monedas, avisos, nube, PWA, seguridad, privacidad) y marco común `FeatureIllustrationFrame`.

### Cambiado
- `FeaturesGrid`: sustituye marquesina y toasts HTML por las ilustraciones; grilla `md:2` / `lg:3` columnas y altura mínima de tarjeta más uniforme.

## [2026-04-09] - Landing: modo claro, layout y sin barra inferior

### Agregado
- Interruptor de tema (sol/luna) en el header público de la landing, usando `next-themes` con persistencia en `localStorage` (`fintrack-theme`).
- Estilos de modo claro para hero (gradientes y olas), secciones de marketing, FAQ, testimonios, tienda y footer.
- `src/lib/landing-layout.ts`: `LANDING_CONTAINER` y `LANDING_SECTION_Y` / `LANDING_FOOTER_Y` para alinear `max-w-5xl`, paddings (`px-5 sm:px-6 lg:px-8`) y alturas de sección en toda la landing.

### Cambiado
- `body` del layout raíz usa `bg-background` para respetar claro/oscuro en toda la app.
- Tokens semánticos (`foreground`, `muted-foreground`, `card`, `border`) y utilidades `dark:` donde hacía falta para mantener el look oscuro actual.
- Carousel de marketing: grid de dos columnas dentro del mismo contenedor (sin `calc(50vw)`), orden en móvil (carrusel arriba), tarjetas con ancho fluido y foco visible.
- Testimonios: tarjetas con ancho máximo respecto al viewport para evitar overflow en pantallas chicas.
- Hero: CTA principal ancho completo en móvil dentro de un `max-w-lg` centrado.
- Sección tienda / mockup: hover del screenshot con clip interno, zoom más marcado (`scale-[1.12]`), brillo y overlay que cede; marco con leve elevación y sombra; respeta `prefers-reduced-motion`.
- FAQ landing: acordeón con clases `.faq-answer` / `.open`, hijo con `min-height: 0` y sin animar opacidad del panel (evita que el texto desaparezca al abrir); ítems sin clase `reveal` para no chocar con `opacity`/`transform` del scroll-reveal.

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
