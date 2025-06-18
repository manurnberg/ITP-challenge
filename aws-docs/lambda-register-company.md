# AWS Lambda: Registro de Empresas

Este documento describe el diseño funcional de una AWS Lambda que registra empresas, similar al endpoint del sistema principal.

---

## Input esperado

```json
{
  "name": "Acme Corp",
  "type": "PYME"
}
```

---

## Output esperado

**En caso de éxito (201):**
```json
{
  "newCompany": {
    "id": "generated-uuid",
    "name": "Acme Corp",
    "type": "PYME",
    "registeredAt": "2025-06-17T18:00:00.000Z"
  }
}
```

**En caso de error de validación (400):**
```json
{
  "message": "Validation failed: 'name' is required and must be a string"
}
```

**En caso de error interno (500):**
```json
{
  "message": "Internal server error"
}
```

---

## Lógica de la Lambda (JavaScript)

```js
/**
 * AWS Lambda handler para registrar una empresa.
 * @param {object} event - Evento de API Gateway
 * @returns {object} response
 */

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamo = new DynamoDBClient({ region: 'us-east-1' }); // Cambia la región si es necesario
const TABLE_NAME = 'Companies';

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { name, type } = body;

    if (!name || typeof name !== 'string') {
      return badRequest("'name' is required and must be a string");
    }

    if (!['PYME', 'CORPORATE'].includes(type)) {
      return badRequest("'type' must be either 'PYME' or 'CORPORATE'");
    }

    const newCompany = {
      id: crypto.randomUUID(),
      name,
      type,
      hasRecentTransfers: false,
      registeredAt: new Date().toISOString(),
    };

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: newCompany.id },
        name: { S: newCompany.name },
        type: { S: newCompany.type },
        hasRecentTransfers: { S: newCompany.hasRecentTransfers }
        registeredAt: { S: newCompany.registeredAt },
      },
    });

    await dynamo.send(command);

    console.log('Saving company:', newCompany);

    return {
      statusCode: 201,
      body: JSON.stringify({
        newCompany,
      }),
    };
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

function badRequest(msg) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message: `Validation failed: ${msg}` }),
  };
}
```

---

## Integración con el sistema

- Creamos la tabla `Companies` en DynamoDB con los atributos `id`, `name`, `type`, `hasRecentTransfers` y `registeredAt`.
- Desplegamos la función Lambda que procesa las solicitudes de adhesión, asegurándonos de subir el código y configurar el runtime adecuado.
- Creamos un rol IAM para la Lambda con permisos específicos para escribir en la tabla DynamoDB.
- Configuramos una API REST en API Gateway con el método POST `/companies`.
- Asignamos un tipo de autorización (NONE, IAM o JWT Cognito) según necesidad y habilitamos CORS para el dominio de la app.
- Asociamos la Lambda a la API Gateway y concedemos permisos explícitos para que API Gateway pueda invocar la Lambda.
- Desplegamos la API Gateway en un *stage* (por ejemplo, `dev` o `prod`) para obtener la URL pública.
- Realizamos pruebas iniciales con herramientas como Postman para validar que la integración funciona correctamente.
- Configuramos CloudWatch para monitorizar logs y errores de la Lambda.

---
