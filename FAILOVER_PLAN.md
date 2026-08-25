# Plan: Failover entre servicios de IA

## Objetivo

Hacer que `POST /job-offer` pruebe los proveedores disponibles en orden y solo termine con error cuando ninguno pueda responder. Un entorno sin proveedores configurados responderá `503 Service Unavailable`.

## Forma de trabajo

- Implementar un paso por vez, en el orden indicado.
- Al terminar cada paso, ejecutar su evaluación y registrar el resultado en este archivo.
- No comenzar el siguiente paso hasta que todos los criterios del actual estén aprobados.
- Usar `pnpm exec tsc --noEmit` como verificación automática; el proyecto no tiene suite de tests.

## Paso 1: Registrar solo proveedores disponibles

**Problema:** `src/config/env.ts` exige `GROQ_API_KEY` al importar el módulo, aunque Groq esté inactivo. Una credencial ausente puede impedir que el servidor arranque antes de aplicar cualquier failover.

**Cambios:**

- Hacer opcionales las credenciales de proveedores en el esquema global.
- Validar cada credencial cuando se construye o utiliza su proveedor, no al iniciar módulos ajenos.
- Construir la lista de servicios usando únicamente proveedores con configuración suficiente.
- Responder `503 Service Unavailable` cuando no haya ningún proveedor disponible.

**Evaluación:**

- [ ] `pnpm exec tsc --noEmit` finaliza correctamente.
- [ ] El servidor arranca sin `GROQ_API_KEY`.
- [ ] El servidor arranca sin credenciales de proveedores.
- [ ] `POST /job-offer` responde 503 cuando la lista de servicios está vacía.
- [ ] Resultado registrado antes de iniciar el paso 2.

## Paso 2: Intentar todos los proveedores

**Problema:** el `try/catch` actual llama a un solo servicio y responde 502 ante su primer error.

**Cambios:**

- Conservar el round-robin únicamente para elegir el primer proveedor de cada petición.
- Recorrer una sola vez todos los proveedores disponibles desde ese punto inicial.
- Capturar y registrar el error de cada intento sin terminar la petición.
- Devolver la primera respuesta válida.
- Responder 502 únicamente después de que todos los proveedores intentados fallen.
- Mantener la validación del body y su respuesta 400 antes del failover.

**Evaluación:**

- [ ] `pnpm exec tsc --noEmit` finaliza correctamente.
- [ ] Un primer proveedor exitoso produce una respuesta 200.
- [ ] Si el primer proveedor falla, se intenta el siguiente dentro de la misma petición.
- [ ] Si todos fallan, la respuesta es 502 y el log identifica cada fallo.
- [ ] Un body inválido responde 400 sin invocar proveedores.
- [ ] Cada proveedor se intenta como máximo una vez por petición.
- [ ] Resultado registrado antes de iniciar el paso 3.

## Paso 3: Limitar el tiempo de cada intento

**Problema:** un proveedor que queda pendiente no genera un error y bloquea el salto al siguiente servicio.

**Cambios:**

- Definir un timeout común y explícito por intento.
- Aplicarlo mediante las opciones de timeout de OpenAI y Groq.
- Aplicarlo mediante una señal de cancelación al `fetch` de Ollama.
- Tratar el timeout como un fallo recuperable que activa el siguiente proveedor.

**Evaluación:**

- [ ] `pnpm exec tsc --noEmit` finaliza correctamente.
- [ ] Un proveedor inaccesible se cancela dentro del tiempo configurado.
- [ ] Después del timeout se intenta el siguiente proveedor.
- [ ] Si un proveedor posterior responde, la petición termina con 200.
- [ ] Resultado registrado antes de iniciar el paso 4.

## Paso 4: Verificar el flujo completo

Usar el body y el procedimiento manual de `TESTING.md`. Sus ejemplos apuntan al puerto 3005; las pruebas deben usar el valor real de `PORT`.

| Escenario | Resultado esperado | Estado |
| --- | --- | --- |
| Primer proveedor válido | 200 con un `JobOffer` válido | Pendiente |
| Primer proveedor falla y el segundo responde | 200 desde el segundo proveedor | Pendiente |
| Todos los proveedores fallan | 502 después de intentar todos una vez | Pendiente |
| Ningún proveedor está configurado | 503 sin intentar llamadas externas | Pendiente |
| Body sin un `offer` no vacío | 400 sin intentar proveedores | Pendiente |
| Un proveedor excede el timeout | Se cancela y continúa con el siguiente | Pendiente |

**Evaluación final:**

- [ ] `pnpm exec tsc --noEmit` finaliza correctamente.
- [ ] Todos los escenarios de la tabla están aprobados y registrados.
- [ ] No quedan procesos de prueba ejecutándose.

## Fuera de alcance

- Reintentar el mismo proveedor dentro de una petición.
- Circuit breaker y estado de salud persistente entre peticiones.
- Backoff automático.
- Incorporar una suite de tests automatizados.

Estas mejoras agregan estado y políticas nuevas. Se evaluarán después de estabilizar el failover de un intento por proveedor.
