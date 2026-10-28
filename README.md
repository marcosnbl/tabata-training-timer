# Interval Training

Temporizador de intervalos para entrenamientos **Tabata, HIIT y EMOM**, con interfaz en español, rutinas personalizadas y soporte de aplicación web progresiva (PWA).

Pensado para entrenar con el teléfono o la computadora a la vista: fondo carbón, números monoespaciados de gran tamaño, colores por fase y controles táctiles accesibles. No requiere registro ni una base de datos para funcionar.

## Funcionalidades

- Iniciar, pausar, continuar y reiniciar el entrenamiento.
- Avanzar o retroceder entre intervalos.
- Fases de preparación, trabajo, descanso y descanso entre series, con pantalla de finalización.
- Indicadores de ronda, serie, ciclo, siguiente intervalo, tiempo restante y progreso de sesión.
- Cuenta regresiva visual y pitidos sintetizados con Web Audio API, sin archivos de audio externos.
- Opción para mantener la pantalla encendida mediante Screen Wake Lock API.
- Pantalla completa, según compatibilidad del navegador.
- Creador de rutinas con tiempos, rondas, series y ciclos configurables.
- Guardado y eliminación de rutinas personalizadas en `localStorage`.
- Manifest, service worker e iconos para instalación como PWA en navegadores compatibles.

### Rutinas incluidas

| Rutina         | Trabajo | Descanso entre rondas | Rondas |
| -------------- | ------- | --------------------- | ------ |
| Tabata clásico | 20 s    | 10 s                  | 8      |
| HIIT 30 / 30   | 30 s    | 30 s                  | 10     |
| EMOM 1 minuto  | 60 s    | Dentro del minuto     | 10     |

Los presets incluyen 10 segundos de preparación. Cada ciclo contiene series y cada serie contiene rondas. El descanso entre series también separa los ciclos; la última ronda termina sin descanso adicional.

En EMOM, cada intervalo es una ventana de 60 segundos: realiza las repeticiones y aprovecha el tiempo sobrante para recuperar.

## Tecnologías

- **Next.js 16**, con App Router.
- **React 19** y **TypeScript** en modo estricto.
- **Tailwind CSS 4** y estilos CSS personalizados.
- **Lucide React** para iconos.
- APIs del navegador: Web Audio, Screen Wake Lock, Fullscreen, Service Worker y localStorage.

## Desarrollo local

Necesitas Node.js compatible con Next.js 16 (mínimo **20.9**) y npm. Para ejecutar directamente las pruebas TypeScript incluidas, utiliza **Node.js 22.6 o superior**.

Desde la carpeta del proyecto:

```sh
npm ci
npm run dev
```

Abre [http://localhost:3002](http://localhost:3002).

El puerto local configurado es **3002**. Si aparece `EADDRINUSE`, ya hay otro proceso utilizándolo: reutiliza el servidor abierto o detén esa instancia antes de iniciar otra. Puedes detener el servidor de tu terminal con `Ctrl + C`.

### Scripts

| Comando             | Función                                                                   |
| ------------------- | ------------------------------------------------------------------------- |
| `npm run dev`       | Desarrollo con Webpack en el puerto 3002.                                 |
| `npm run build`     | Compilación de producción y comprobación de tipos.                        |
| `npm start`         | Servidor de producción local en el puerto 3002. Requiere un build previo. |
| `npm run typecheck` | Comprobación de TypeScript sin generar archivos.                          |

Para probar el modo producción y el comportamiento sin conexión:

```sh
npm run build
npm start
```

Detén primero el servidor de desarrollo si está ocupando el mismo puerto.

## Subir a GitHub

1. Crea un repositorio vacío en GitHub, por ejemplo `interval-training`. No agregues un README remoto si vas a subir esta carpeta como primer commit.
2. Si la carpeta todavía no tiene un repositorio Git, ejecuta:

   ```sh
   git init
   git add .
   git commit -m "Initial commit: Interval Training"
   git branch -M main
   ```

3. Reemplaza `TU_USUARIO` y el nombre del repositorio por los tuyos:

   ```sh
   git remote add origin https://github.com/TU_USUARIO/interval-training.git
   git push -u origin main
   ```

Si ya existe un repositorio o un remoto `origin`, revisa `git status` y `git remote -v` y utiliza la configuración existente. El `.gitignore` excluye `node_modules`, `.next` y los archivos de caché de TypeScript; incluye `package-lock.json` para conservar las versiones resueltas de las dependencias.

Consulta la [guía oficial de GitHub para subir un proyecto local](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

## Publicar en Vercel

1. Sube el código a GitHub.
2. En Vercel, selecciona **Add New → Project** y conecta tu cuenta de GitHub.
3. Importa el repositorio del proyecto.
4. Revisa la configuración antes de desplegar:

   | Opción                | Valor                                                |
   | --------------------- | ---------------------------------------------------- |
   | Framework Preset      | Next.js                                              |
   | Root Directory        | Raíz del proyecto (`./`), donde está `package.json`. |
   | Build Command         | `npm run build`                                      |
   | Install Command       | `npm ci`, o detección automática con npm.            |
   | Output Directory      | Valor predeterminado de Next.js, sin override.       |
   | Environment Variables | No se requieren en la implementación actual.         |

5. Selecciona **Deploy** y abre la URL generada cuando termine la compilación.

El puerto 3002 corresponde al servidor local: en Vercel se accede a la URL HTTPS del despliegue. No necesitas ejecutar `npm start` manualmente allí ni agregar `vercel.json` para este proyecto.

Con la integración Git configurada, los cambios en la rama de producción generan nuevos despliegues; las ramas y pull requests pueden generar vistas previas. Revisa la rama de producción en los ajustes del proyecto.

Referencias: [Next.js en Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [despliegues desde Git](https://vercel.com/docs/git) y [configuración del build](https://vercel.com/docs/builds/configure-a-build).

## Instalación PWA y uso sin conexión

Abre el sitio mediante HTTPS o localhost. Si el navegador ofrece la opción, utiliza **Instalar aplicación** o **Agregar a pantalla de inicio**.

El service worker guarda la página y los recursos que se descargan durante el uso. Para probar el acceso sin conexión, abre primero la aplicación de producción en línea y deja que cargue completamente; después desconecta la red y vuelve a abrirla. Los recursos que no llegaron a almacenarse pueden no estar disponibles sin conexión.

La instalación, el bloqueo de pantalla y el modo pantalla completa dependen del navegador y del sistema operativo.

## Persistencia y precisión

**Las rutinas se guardan en el navegador y dispositivo donde fueron creadas.** Publicar en Vercel no sincroniza los datos entre celulares, computadoras o perfiles de navegador. Tampoco se transfieren automáticamente las rutinas de localhost al dominio publicado. Borrar los datos del sitio elimina las rutinas guardadas.

Actualmente no hay autenticación, base de datos remota, sincronización ni exportación/importación de rutinas. La interfaz `RoutineRepository` permite incorporar otra implementación de persistencia en el futuro.

El temporizador calcula el avance con una referencia absoluta de `performance.now()` y actualiza la pantalla mediante `requestAnimationFrame`, evitando acumular el error de contar callbacks. El navegador puede suspender JavaScript o el audio en segundo plano: no se garantizan avisos durante una suspensión. Al reanudarse la ejecución, el reloj vuelve a calcular la fase correspondiente.

El audio se habilita con la interacción del usuario al iniciar el entrenamiento. Wake Lock requiere un contexto seguro y puede ser liberado por el sistema al ocultar la pestaña.

## Estructura del proyecto

```text
src/
  app/
    layout.tsx             # Layout, idioma y metadatos
    page.tsx               # Temporizador y selección de rutinas
    globals.css            # Diseño adaptable y colores por fase
    favicon.ico            # Icono de la pestaña
  components/
    RoutineEditor.tsx      # Formulario de rutinas
    TimerDisplay.tsx       # Dígitos del temporizador
  hooks/
    useTabataTimer.ts      # Estados, controles y cálculo temporal
    useTimerEffects.ts     # Sonidos y bloqueo de pantalla
  lib/
    routines.ts            # Tipos, presets, secuencias y repositorio
public/
  manifest.webmanifest     # Identidad de la PWA
  sw.js                    # Caché y acceso sin conexión
  icon.svg                 # Icono vectorial
  icon-192.png             # Icono PWA
  icon-512.png             # Icono PWA
tests/
  routines.test.ts         # Pruebas de secuencias y validación
```

## Validación

```sh
npm run typecheck
node --experimental-strip-types --test tests/routines.test.ts
npm run build
```

Las pruebas incluidas cubren secuencias de intervalos, duración de presets, series/ciclos, omisión de intervalos de cero segundos, validación de rutinas y formato del tiempo. La compatibilidad del audio, Wake Lock, instalación y caché debe comprobarse también en los dispositivos y navegadores de destino.

