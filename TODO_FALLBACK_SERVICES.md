# TODO: fallback entre servicios de IA

## Objetivo

Implementar un router con round-robin y fallback para que cada solicitud comience
con un proveedor diferente y, si ese proveedor falla, pruebe los demás antes de
responder con un error.

## Implementacion

- [ ] Activar los tres proveedores en `src/app.ts`:

  ```ts
  const services: AIService[] = [groqService, openaiService, ollamaService];
  ```

- [ ] Importar `JobOffer` junto con `AIService` en `src/app.ts`.

- [ ] Reemplazar `nextService()` por una funcion asincrona
  `analyzeWithFallback(offerText)`.

- [ ] En `analyzeWithFallback`, guardar `currentServiceIndex` como indice inicial
  de la solicitud.

- [ ] Avanzar `currentServiceIndex` una sola vez por solicitud para mantener el
  round-robin:

  ```ts
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  ```

- [ ] Recorrer todos los proveedores desde el indice inicial, haciendo
  wrap-around:

  ```ts
  const service = services[(startIndex + attempt) % services.length];
  ```

- [ ] Ejecutar cada llamada dentro de un `try/catch` independiente.

- [ ] Si un proveedor responde correctamente, devolver inmediatamente:

  ```ts
  { jobOffer, provider: service.name }
  ```

- [ ] Si un proveedor falla, registrar su nombre y el mensaje del error y
  continuar con el siguiente.

- [ ] Si todos los proveedores fallan, lanzar un error que contenga el resumen
  de los intentos fallidos.

- [ ] Actualizar `POST /job-offer` para usar `analyzeWithFallback()`.

- [ ] Incluir el proveedor exitoso en la respuesta sin eliminar los campos
  actuales:

  ```json
  {
    "provider": "groq",
    "jobTitle": "Frontend Developer"
  }
  ```

- [ ] Mantener la respuesta HTTP `502` solo para el caso en que todos los
  servicios hayan fallado.

- [ ] No exponer en la respuesta HTTP claves, credenciales ni detalles internos
  sensibles de los errores. Dejar esos detalles solamente en los logs.

## Configuracion

- [ ] Verificar que `.env.development` tenga `GROQ_API_KEY`.

- [ ] Verificar que `.env.development` tenga `OPENAI_API_KEY`.

- [ ] Verificar que `OLLAMA_BASE_URL` apunte a la instancia correcta de Ollama;
  por defecto es `http://localhost:11434`.

- [ ] Corregir y completar `.env.example` usando el formato `CLAVE=valor`:

  ```dotenv
  PORT=3000
  GROQ_API_KEY=
  OPENAI_API_KEY=
  OLLAMA_BASE_URL=http://localhost:11434
  ```

- [ ] Confirmar que el modelo configurado en cada servicio existe y está
  disponible para la cuenta o instalación correspondiente.

- [ ] Descargar el modelo de Ollama si todavía no está instalado:

  ```bash
  ollama pull deepseek-r1:1.5b
  ```

## Documentacion

- [ ] Actualizar `TESTING.md` para documentar el campo `provider` de la respuesta
  exitosa.

- [ ] Actualizar la descripción del código `502` para indicar que se devuelve
  cuando todos los proveedores fallan.

- [ ] Agregar un ejemplo de respuesta exitosa con el proveedor utilizado.

## Verificacion

- [ ] Ejecutar el type-check:

  ```bash
  pnpm exec tsc --noEmit
  ```

- [ ] Iniciar la API:

  ```bash
  pnpm dev
  ```

- [ ] Ejecutar una solicitud válida siguiendo las instrucciones de `TESTING.md`.

- [ ] Confirmar que una respuesta exitosa tenga `provider` y los datos de la
  oferta.

- [ ] Realizar al menos tres solicitudes y confirmar en los logs que el primer
  proveedor rota entre Groq, OpenAI y Ollama.

- [ ] Simular la caída de Groq y comprobar que la misma solicitud continúa con
  OpenAI u Ollama.

- [ ] Simular la caída de OpenAI y comprobar que la solicitud continúa con el
  siguiente proveedor.

- [ ] Apagar Ollama temporalmente y comprobar que su error no detiene el intento
  de los demás proveedores.

- [ ] Simular la caída de los tres proveedores y comprobar que la API responde:

  ```http
  HTTP/1.1 502 Bad Gateway
  ```

- [ ] Confirmar que los logs identifican cada proveedor fallido y conservan la
  causa del error.

## Pruebas automatizadas recomendadas

- [ ] Configurar un framework de pruebas, ya que actualmente `pnpm test` no
  ejecuta pruebas reales.

- [ ] Probar que el primer proveedor exitoso corta la cadena de intentos.

- [ ] Probar que, al fallar el primer proveedor, se invoca el segundo.

- [ ] Probar que el orden de inicio rota entre solicitudes.

- [ ] Probar que cada proveedor se intenta como maximo una vez por solicitud.

- [ ] Probar que el endpoint responde `502` cuando todos fallan.

- [ ] Probar que el endpoint conserva el `400` cuando `offer` falta o está vacío.

## Criterios de aceptacion

- [ ] Ninguna solicitud falla mientras al menos uno de los tres proveedores
  pueda producir una respuesta válida.

- [ ] Los proveedores se distribuyen mediante round-robin y se usan como
  fallback dentro de la misma solicitud.

- [ ] La respuesta exitosa identifica el proveedor utilizado.

- [ ] El endpoint solo devuelve `502` después de intentar los tres proveedores.

- [ ] El proyecto pasa el type-check y la documentación coincide con el
  comportamiento implementado.
