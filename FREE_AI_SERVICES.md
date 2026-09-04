# Servicios de IA con modelos gratuitos

Lista de proveedores y modelos gratuitos (o de capa gratuita) que se pueden usar
para rotar/fallback en el proyecto.

---

## 1. OpenRouter (ya implementado)

Agregador que permite acceder a múltiples modelos gratuitos con una sola API key.

Modelos gratuitos recomendados:

- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-4-scout:free`
- `deepseek/deepseek-chat:free`
- `mistralai/mistral-small-3.1-24b-instruct:free`
- `nvidia/llama-3.1-nemotron-nano-8b-v1:free`

**Ventaja:** amplia variedad de modelos y proveedores bajo una sola cuenta.

---

## 2. Groq (ya implementado)

Muy rápido y con capa gratuita generosa.

Modelos recomendados:

- `llama-3.3-70b-versatile`
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

---

## 3. Cerebras (ya implementado)

Capa gratuita con buenos límites.

Modelo recomendado:

- `llama-3.3-70b`

---

## 4. Mistral (ya implementado)

Tier gratuito con límites.

Modelos recomendados:

- `mistral-small-latest`
- `codestral-latest`

---

## 5. SambaNova

Buena alternativa gratuita, similar a Groq.

Modelos recomendados:

- `Meta-Llama-3.1-8B-Instruct`
- `Meta-Llama-3.1-70B-Instruct`
- `Meta-Llama-3.3-70B-Instruct`

**Web:** <https://sambanova.ai/>

---

## 6. Fireworks AI

Tiene tier gratuito.

Modelos recomendados:

- `accounts/fireworks/models/llama-v3p1-8b-instruct`
- `accounts/fireworks/models/llama-v3p1-70b-instruct`

**Web:** <https://fireworks.ai/>

---

## 7. GitHub Models

Gratis con rate limits si se tiene cuenta de GitHub.

Modelos recomendados:

- `gpt-4o-mini`
- `meta-llama-3.1-8b-instruct`
- `mistral-small`

**Web:** <https://github.com/marketplace/models>

---

## Recomendación práctica

Como el proyecto ya tiene implementados **OpenRouter**, **Groq**, **Cerebras** y
**Mistral**, la forma más rápida de obtener alta disponibilidad es:

1. Activar el fallback entre los servicios existentes.
2. Configurar **OpenRouter** con modelos marcados como `:free` como respaldo
   principal.
3. Si se necesitan más opciones, agregar **SambaNova** o **Fireworks AI**.

---

## Notas importantes

- Los modelos gratuitos suelen tener **rate limits** más bajos.
- La disponibilidad de los modelos `:free` en OpenRouter puede variar.
- Si un modelo devuelve `503 UNAVAILABLE` o errores de cuota, simplemente se
  prueba con el siguiente proveedor en la rotación.
