# Changelog

Todos los cambios relevantes del proyecto se documentan en este archivo.

## [2026-04-10] - Cuentas: texto de ayuda del sheet más corto

### Cambiado
- `src/app/(app)/cuentas/page.tsx`: descripción de «Qué es Mis Cuentas» acortada (nacional vs internacional, enfoque en organizar finanzas).

## [2026-04-10] - Inicio: accesos rápidos compactos y carrusel en móvil

### Cambiado
- `src/app/(app)/inicio/page.tsx`: ítems de «Accesos rápidos» más chicos en móvil (`h-12 w-12`, columna `4.5rem`), texto `10px`; en `md+` se mantienen `h-20 w-20` y `w-24`. Fila con `overflow-x-auto`, `scrollbar-hide` y `snap-x` para carrusel; bleed horizontal `-mx-4 px-4` en móvil.

## [2026-04-10] - Layout: padding superior móvil bajo header (inicio)

### Cambiado
- `src/components/layout/app-main.tsx`: en `/inicio` el `main` usa `padding-top: calc(safe-area + 4rem + 1rem)` para alinear con header fijo (`h-16`) y dejar ~16px de separación (antes `pt-18` dejaba ~8px).
- `src/components/layout/sidebar.tsx`: el header móvil aplica `padding-top` con `env(safe-area-inset-top)` y la fila interior mantiene `h-16`.
- Rutas sin barra superior: `padding-top` mínimo algo mayor y con respeto al notch.

## [2026-04-10] - Cuentas: quitar línea de cotización referencia

### Cambiado
- `src/app/(app)/cuentas/page.tsx`: se elimina el texto «Cotización referencia: …» bajo el balance total.

## [2026-04-10] - Layout: header móvil solo en inicio

### Cambiado
- `src/components/layout/sidebar.tsx`: la barra superior fija (`md:hidden`) solo se muestra en `/inicio`; el resto de rutas del área app no la incluyen.
- `src/components/layout/app-main.tsx` + `src/app/(app)/layout.tsx`: el padding superior en móvil usa `pt-18` solo con esa barra; en el resto de pantallas `pt-4` para no dejar hueco.

## [2026-04-10] - Cuentas: balance total sin bloque negro y pills con banderas

### Cambiado
- `src/app/(app)/cuentas/page.tsx`: la franja «Balance total» deja de usar `bg-black` y hereda el fondo de la página; las pills de filtro replican el estilo del inicio (`bg-black/18`, banderas 🇺🇾 🇺🇸 🇧🇷 🇦🇷 con etiquetas `$` / `US$` / `R$` / `AR$`, «Todas» con ícono de grilla).

## [2026-04-10] - Avatares banco: círculo completo en onboarding y Cuentas

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: `PresetBrandAvatar` usa `Image` con `fill` y `object-contain` dentro de un círculo blanco (misma idea que `AccountBrandAvatar`); contenedores `relative` para el layout.
- `src/app/(app)/cuentas/page.tsx`: se quitan `rounded-xl` / `rounded-lg` en wrappers y props del avatar para que el logo de banco se vea siempre como favicon circular.
- `src/app/(app)/cuentas/page.tsx`: estado `newAccount` tipado con `NewAccountDraft` para que el selector de color compile con `ACCOUNT_COLOR_OPTIONS`.

## [2026-04-10] - Cuentas: filas UYU+USD con pill y total unificado

### Cambiado
- `src/app/(app)/cuentas/page.tsx`: las cuentas hermana `Nombre` + `Nombre USD` se muestran en una sola tarjeta compacta; pill `$` / `US$` elige el saldo principal y el otro queda como referencia (`≈`). Reordenar y arrastrar operan por fila (el par se mueve junto).

## [2026-04-10] - Cuentas: resumen «Balance total» estilo referencia

### Cambiado
- `src/app/(app)/cuentas/page.tsx`: el total deja la tarjeta tipo inicio; ahora es bloque negro con «Balance total», ojo para ocultar montos, actualizar cotizaciones, monto grande y barra de pills (Todas + $ Pesos / US$ Dólares / R$ / AR$). Las pills filtran la lista de cuentas; el reordenamiento solo está activo en «Todas». «Todas» muestra el patrimonio combinado en pesos uruguayos (equivalente UYU).

### Añadido
- `src/app/(app)/cuentas/page.tsx`: junto al título, selector de moneda (menú con chevron) que convierte el balance total en vivo según cotizaciones; botón de ayuda que abre un sheet inferior con texto explicativo y «Entendido» (colores Platita).

### Cambiado
- `src/app/(app)/cuentas/page.tsx`: el CTA «Añadir cuenta» pasa a una sola fila horizontal (ícono + título + subtítulo) y contenedor más bajo y fino.

## [2026-04-09] - Inicio: quitar línea de rango bajo tarjeta de balance

### Cambiado
- `src/app/(app)/inicio/page.tsx`: se elimina el texto «Ingresos, gastos y resúmenes abajo: …» en la tarjeta verde; el filtro por fechas sigue igual.

## [2026-04-09] - Inicio: filtro de fechas en tarjeta de balance

### Añadido
- `src/components/dashboard/dashboard-period-filter.tsx`: botón junto al ojo con popover — opciones rápidas (hoy, 7 días, semana, mes, mes pasado, año) y rango personalizado con inputs fecha + Aplicar.
- `GET /api/dashboard`: períodos `today`, `last_7_days`, `this_week`, `this_year`; respuesta incluye `range: { from, to }` en `yyyy-MM-dd`.

### Cambiado
- `src/app/(app)/inicio/page.tsx`: el fetch del dashboard usa el período elegido; ingresos/gastos, tendencia, categorías, presupuestos y últimos movimientos siguen ese rango. El monto grande «Tu Balance» sigue siendo patrimonio actual en cuentas; texto aclara conversión y el rango aplicado abajo.

## [2026-04-09] - Avatar logo banco: círculo blanco sin estirar

### Cambiado
- `src/components/accounts/account-brand-avatar.tsx`: logos en círculo blanco con borde, `grid` + `object-contain` y padding para que no se deformen; ícono Lucide sigue en círculo semitransparente.
- `src/components/dashboard/account-cards.tsx`: tamaño del avatar sin `bg-white/15` duplicado en el logo.

## [2026-04-09] - Cuentas: presets unificados + logo por nombre si falta logo_url

### Añadido
- `src/lib/account-presets.ts`: lista única de bancos/wallets (nacional + internacional), `resolveAccountDisplayLogoUrl` (usa `logo_url` en DB; si es `null`/`undefined` infiere logo por nombre normalizado, ej. `ITAU UY` → Itaú; `logo_url === ""` fuerza solo ícono).

### Cambiado
- `src/components/accounts/account-brand-avatar.tsx`: usa `resolveAccountDisplayLogoUrl` para mostrar imagen aunque la fila no tenga `logo_url` guardado todavía.
- `src/app/(onboarding)/onboarding/page.tsx` y `src/app/(app)/cuentas/page.tsx`: importan los mismos presets desde `account-presets` (sin duplicar listas).
- `src/app/api/accounts/route.ts` y onboarding `complete`: permiten `logo_url: ""` para marcar “sin logo inferido”.

## [2026-04-09] - Cuentas: logo persistente y color desde el inicio

### Añadido
- `supabase/migrations/007_accounts_logo_url.sql` y columna `logo_url` en `supabase/schema.sql`: guarda ruta local (`/banks/...`) o URL del logo elegido al crear la cuenta.
- `src/components/accounts/account-brand-avatar.tsx`: avatar con imagen o ícono Lucide si falla la imagen.

### Cambiado
- `src/app/api/accounts/route.ts` y `src/app/api/onboarding/complete/route.ts`: crear/actualizar cuenta con `logo_url` opcional.
- `src/app/(onboarding)/onboarding/page.tsx`: envía `logo_url` del preset al completar onboarding (misma imagen que en el flujo).
- `src/components/dashboard/account-cards.tsx`: muestra el logo en las tarjetas del dashboard; botón con paleta abre popover para cambiar color (PUT) sin ir a Cuentas.
- `src/app/(app)/inicio/page.tsx`: actualiza la lista de cuentas en estado al cambiar color desde las tarjetas.
- `src/app/(app)/cuentas/page.tsx`: alta de cuenta envía `logo_url` del preset; tarjetas y selector usan logos locales uruguayos alineados con onboarding; en edición, vista previa con logo y acción «Quitar logo».
- `src/types/database.ts`: tipo `Account` con `logo_url` opcional.

## [2026-04-09] - Inicio: accesos rápidos bajo la bottom nav (z-index)

### Cambiado
- `src/app/(app)/inicio/page.tsx`: el bloque de accesos rápidos ya no usa `z-40` en el contenedor (evita que los círculos tapen el menú inferior fijo en mobile, que compartía el mismo z-index y quedaba debajo en el orden del DOM). Panel de calculadora abierta: overlay `z-[45]` y panel `z-50` en mobile; en `md+` el panel vuelve a `z-40` al ser `absolute`.

## [2026-04-09] - Inicio: un solo control para ocultar montos

### Cambiado
- `src/app/(app)/inicio/page.tsx`: se quita el botón ojo/ojo tachado de la barra superior (Nacional); el toggle sigue en la tarjeta de balance para no duplicar la acción.

## [2026-04-09] - Inicio: CTA primeros pasos legible en mobile

### Cambiado
- `src/app/(app)/inicio/page.tsx`: título del botón «Completá los primeros pasos» con `text-sm` en viewport chico, `leading-snug`, ícono más chico y contenedor `min-w-0`/`shrink-0` para que no se parta feo ni compita con el badge.

## [2026-04-09] - Onboarding cuenta: edición habilitada siempre + personalizado en internacional

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: el campo `Nombre` de cuenta queda editable también cuando se selecciona un preset nacional (ya no solo en `Personalizado`).
- `src/app/(onboarding)/onboarding/page.tsx`: el selector de `Icono` se muestra siempre para poder ajustar la cuenta aun partiendo de un preset.
- `src/app/(onboarding)/onboarding/page.tsx`: al editar nombre o icono, el preset pasa automáticamente a estado `Personalizado`.
- `src/app/(onboarding)/onboarding/page.tsx`: se agrega opción `Personalizado` también en la lista de cuentas internacionales.

## [2026-04-09] - Onboarding cuenta: logos locales restantes + opción Personalizado

### Cambiado
- `public/banks/itau.png`, `public/banks/bbva.png`, `public/banks/scotiabank.png`, `public/banks/prex.png`, `public/banks/midinero.png`: se agregan logos locales de bancos/billeteras para evitar depender de hotlinks externos.
- `src/app/(onboarding)/onboarding/page.tsx`: presets nacionales usan logos locales para Itaú, BBVA, Scotiabank, Prex y MiDinero.
- `src/app/(onboarding)/onboarding/page.tsx`: se agrega opción `Personalizado` después de MiDinero; permite editar nombre e icono a elección.
- `src/app/(onboarding)/onboarding/page.tsx`: el campo `Nombre` refleja automáticamente el preset seleccionado y queda editable solo en `Personalizado`.

## [2026-04-09] - Onboarding cuenta: logo BROU local (estable)

### Cambiado
- `public/banks/brou.png`: se agrega asset local del logo de BROU para evitar dependencia de hotlink externo.
- `src/app/(onboarding)/onboarding/page.tsx`: preset BROU usa `logoUrl` local (`/banks/brou.png`) en lugar de Clearbit.

## [2026-04-09] - Onboarding cuenta: quitar Efectivo y corregir logos

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: se elimina la opción `Efectivo UYU` de la grilla de presets de cuenta.
- `src/app/(onboarding)/onboarding/page.tsx`: se agrega `PresetBrandAvatar` con fallback visual para logos de banco/billetera (si el logo externo falla, se muestra icono en lugar de imagen rota).

## [2026-04-09] - Onboarding cuenta: logos reales, efectivo destacado y prefijos de saldo

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: opciones de banco/billetera en el paso de cuenta ahora muestran logos reales (Clearbit) cuando hay disponibilidad, con fallback de icono.
- `src/app/(onboarding)/onboarding/page.tsx`: se agrega `Efectivo UYU` como opción explícita y destacada en verde dentro de cuentas nacionales.
- `src/app/(onboarding)/onboarding/page.tsx`: inputs de saldo muestran prefijo automático de moneda (`$` o `US$`) para mejorar legibilidad mientras se escribe.
- `src/app/(onboarding)/onboarding/page.tsx`: al cambiar entre Nacional/Internacional se resetea a un preset coherente del scope para evitar combinaciones cruzadas.

## [2026-04-09] - Dashboard: calculadora de divisas más completa en mobile

### Cambiado
- `src/app/(app)/inicio/page.tsx`: el panel de conversor se rediseña como mini-calculadora más pro y en mobile se despliega casi full-width (`fixed inset-x-3`) en lugar de popover pequeño.
- `src/app/(app)/inicio/page.tsx`: se agrega botón para recargar cotización en tiempo real (POST `/api/exchange-rates`) con estado de carga visual.
- `src/app/(app)/inicio/page.tsx`: se muestra fecha/hora de última actualización de cotizaciones en formato `es-UY`.
- `src/app/(app)/inicio/page.tsx`: mejoras visuales de selección de monedas (banderas más visibles), input de monto y bloque de resultado para una lectura más clara.

## [2026-04-09] - Onboarding: paso de primera cuenta + checklist inicial más útil

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: se agrega el paso `account` antes de categorías con UI estilo modal (Nacional/Internacional, selección rápida de banco/billetera, nombre de cuenta, saldo inicial, paleta de color y switch para cuenta en dólares con saldo USD).
- `src/app/(onboarding)/onboarding/page.tsx`: el flujo ahora es `welcome -> objectives -> account -> categories -> loading`, con navegación back/next ajustada y validación para exigir nombre de cuenta.
- `src/app/(onboarding)/onboarding/page.tsx`: el payload final de onboarding ahora envía configuración de cuenta seleccionada.
- `src/app/api/onboarding/complete/route.ts`: se valida `account` en el request y se crean cuentas según onboarding (principal + cuenta USD opcional cuando corresponde), en lugar de forzar siempre la cuenta `General`.
- `src/app/(app)/inicio/page.tsx`: los “Primeros pasos” ya no aparecen auto-completados por datos creados durante onboarding; se guarda una línea base por usuario en `localStorage` y solo se marcan como completos cuando el usuario crea elementos adicionales manualmente.

## [2026-04-09] - Onboarding: redirección directa sin pantalla final

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: se elimina el paso visual `done` del flujo; al terminar el guardado en `loading`, el usuario ahora redirige directo a `/inicio`.
- `src/app/(onboarding)/onboarding/page.tsx`: limpieza de tipos/condicionales para quitar la UI de “Onboarding completado” y mantener el flujo más corto.

## [2026-04-09] - Onboarding: analytics no bloquea finalización

### Corregido
- `src/app/api/onboarding/complete/route.ts`: si falla el guardado en `onboarding_sessions` (por ejemplo, tabla inexistente en Supabase), ahora se registra un `console.warn` y el flujo continúa. Esto evita que el usuario quede trabado al terminar onboarding por un error de analytics.

## [2026-04-09] - Onboarding: iconos reales en categorías y subcategorías

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: se reemplazan iniciales de categorías por iconos reales usando el campo `icon` del catálogo (`getIcon`), mejorando identificación visual.
- `src/app/(onboarding)/onboarding/page.tsx`: cada chip de subcategoría ahora muestra su icono correspondiente junto al nombre para escaneo más rápido.
- `src/lib/icons.tsx`: se amplía el mapeo de iconos con claves usadas por el onboarding (`bus`, `smile`, `monitor`, `landmark`) para evitar fallback genérico.

## [2026-04-09] - Onboarding: loader con copy corto y rotación más lenta

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: en la pantalla `loading` se reemplazan frases largas por una estructura más clara (línea superior fija y palabra única rotativa grande) para evitar cortes de texto.
- `src/app/(onboarding)/onboarding/page.tsx`: se reduce la velocidad de rotación del texto de carga (`2400ms` por cambio, antes `1400ms`) para mejorar legibilidad.

## [2026-04-09] - Onboarding: tabs Gastos/Ingresos con iconos y color semántico

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: selector de tipo en categorías ahora incluye iconografía directa (`ArrowDownLeft` para Gastos y `ArrowUpRight` para Ingresos) para reforzar comprensión visual.
- `src/app/(onboarding)/onboarding/page.tsx`: estados activos del switch diferenciados por color semántico (rojo para gastos, verde para ingresos), con `hover` en el mismo lenguaje para mejorar legibilidad rápida.

## [2026-04-09] - Onboarding: remover sugerencias IA en categorías

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: se elimina el bloque de UI «Sugerir categorías con IA (opcional)» del paso de categorías para evitar estados de carga en loop y simplificar el flujo de onboarding.
- `src/app/(onboarding)/onboarding/page.tsx`: limpieza de estado y lógica asociada (`aiLoading`, `aiAttempts`, `aiUsed`, `suggestCategoriesWithAi`, `resetSelectionsFromCatalog`) y remoción de metadata de IA en el payload de finalización.

## [2026-04-09] - Onboarding: bordes mobile, íconos en objetivos y estilo consistente

### Corregido
- `src/app/(onboarding)/layout.tsx`: se elimina el centrado por `flex` del contenedor raíz para evitar espacios laterales no deseados en mobile y permitir full-width real en el flujo de onboarding.

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: pasos de `objetivos` y `categorias` con el mismo lenguaje visual del `welcome` (base oscura, acentos `#5DBCD2`, bordes suaves y superficies glass), manteniendo coherencia dentro de la app.
- `src/app/(onboarding)/onboarding/page.tsx`: `objetivos` incorpora íconos por opción (`Compass`, `HandCoins`, `PiggyBank`, `SlidersHorizontal`) para mejorar escaneo visual.
- `src/app/(onboarding)/onboarding/page.tsx`: reducción de escalas tipográficas y densidad en headings, descripciones, tabs, tarjetas y chips para una lectura más limpia en mobile.
- `src/app/(onboarding)/onboarding/page.tsx`: CTA y acentos de progreso/carga/finalización pasan a paleta de marca (`#5DBCD2`) para consistencia entre pasos.

## [2026-04-09] - Onboarding: bienvenida abstracta sin foto

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: se elimina la imagen/persona del `welcome` y se reemplaza por una escena abstracta animada (orbes, anillos y partículas) para un look más épico y profesional sin depender de assets fotográficos.
- `src/app/(onboarding)/onboarding/page.tsx`: ajuste del layout para mantener texto y CTA en la parte inferior, con mejor centrado visual y más aire debajo del botón (`pb` mayor con safe-area).
- `src/app/(onboarding)/onboarding/page.tsx`: se retira el logo del `welcome` para dejar una pantalla inicial limpia enfocada en la bienvenida y el llamado a la acción.

## [2026-04-09] - Onboarding: estilo inspiración con hero dominante

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: rediseño del paso `welcome` para lograr una estética más cercana al estilo de referencia: sujeto principal más grande, composición vertical más impactante y contenido final anclado al tercio inferior.
- `src/app/(onboarding)/onboarding/page.tsx`: se elimina el logo del bloque inicial y se prioriza una bienvenida visual full-screen con fondo animado, brillos y CTA principal más protagonista.
- `src/app/(onboarding)/onboarding/page.tsx`: ajustes de tipografía y espaciado para mantener coherencia con la landing (headline fuerte, cuerpo legible, botón redondeado de marca).

## [2026-04-09] - Onboarding: welcome full-width y look & feel de landing

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: el paso de bienvenida ahora ocupa toda la pantalla en mobile (`min-h-svh`) sin bordes laterales ni card redondeada, para que funcione como pantalla de presentación post-registro.
- `src/app/(onboarding)/onboarding/page.tsx`: se incorpora `PlatitaBrandLockup` arriba, fondo animado reutilizando capas visuales de la landing (`hero-animated-bg`, `hero-noise`, `hero-waves`) y CTA con estética consistente de marca (`#5DBCD2`, tipografía y microinteracciones).
- `src/app/(onboarding)/onboarding/page.tsx`: reubicación del personaje con `object-contain` y layout vertical más balanceado para evitar cortes/espacios incómodos entre hero y bloque de texto.

## [2026-04-09] - Onboarding: bienvenida con imagen de marca y CTA más seguro en móvil

### Agregado
- `public/onboarding-welcome-hero.png`: ilustración tipo hero (persona con celular, ola y paleta alineada a la landing: #020617 y celeste de marca).

### Cambiado
- `src/app/(onboarding)/onboarding/page.tsx`: paso «welcome» usa la imagen con `next/image`, fondo `#020617`, botón «Continuar» más bajo (`h-11`, texto chico) y `padding` con `env(safe-area-inset-bottom)` para Chrome móvil; barra de progreso de pasos con `emerald-400` (celeste del tema) en lugar de lima.

## [2026-04-09] - Menú FAB: un color por acción

### Cambiado
- `Sidebar` (`quickActionRows`): «Escanear foto» usa ícono sky (antes repetía el primary); «Nueva transferencia» y «Usar plantilla» usan azul y ámbar suaves en lugar del mismo gris.

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
