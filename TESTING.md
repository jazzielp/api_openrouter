# Probar el endpoint `POST /job-offer`

Comando recomendado: guardar el texto crudo de la oferta en `oferta.txt` y generar el body JSON con Node (escapa los saltos de línea automáticamente):

```bash
node -e 'process.stdout.write(JSON.stringify({offer: require("fs").readFileSync("oferta.txt","utf8")}))' \
  | curl -X POST http://localhost:3005/job-offer \
      -H "Content-Type: application/json" \
      -d @-
```

## Request rápido (texto inline)

```bash
curl -X POST http://localhost:3005/job-offer \
  -H "Content-Type: application/json" \
  -d '{"offer": "Desarrollador Front End (React Js) Sr — CITI — Remoto. Requisitos: TypeScript, React, Tailwind CSS. Deseable: Azure DevOps."}'
```

## Respuestas

| Código | Significado |
|--------|-------------|
| 200    | JSON `JobOffer` con los datos extraídos |
| 400    | Body inválido: falta `offer` o el JSON está malformado |
| 502    | La IA no devolvió un JSON válido |

## Notas

- Los saltos de línea deben viajar escapados como `\n` dentro del string JSON; `JSON.stringify` lo hace automáticamente.
- `curl -d @archivo` recorta silenciosamente los saltos de línea del archivo; para mandarlo tal cual usar `--data-binary @archivo`.
