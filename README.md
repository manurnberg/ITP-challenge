# ITP Challenge

Aplicación desarrollada con **NestJS**, que gestiona compañías, almacenadas en una base de datos **SQLite** mediante **Prisma ORM**.

---

## Índice

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Migraciones y Prisma](#migraciones-y-prisma)
- [Ejecutar la App](#ejecutar-la-app)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints y SwaggerUI](#api-endpoints)

---

## Requisitos

- Node.js v18+
- npm o yarn

---

## Instalación

```bash
npm install
```

---

## Configuración

1. Crear un archivo `.env` en la raíz del proyecto copiando el archivo `.env.template`.

2. La configuración es gestionada por `ConfigManager`, que accede a estas variables de entorno desde `src/infraestructure/config/config-manager.ts`.

---

## Migraciones y Prisma

Inicializar la base de datos y aplicar migraciones:

```bash
npx prisma migrate dev --name init
```

Ver el esquema Prisma en:
```bash
prisma/schema.prisma
```

Generar cliente Prisma:
```bash
npx prisma generate
```

---

## Ejecutar la App

```bash
npm run start:dev
```

La app se ejecutará en: [http://localhost:3000](http://localhost:3000)

---

## Estructura del Proyecto

```
src/
├── core/
│   ├── application/
│   │   └── services/                       # Casos de uso
│   ├── domain/
│   │   ├── constants/                      # Tokens de inyección
│   │   ├── entities/                       # Entidades (Company, Transfer)
│   │   ├── ports/                          # Interfaces de Repositorios
│   │   └── value-objects/                 # Value Objects (ej. CompanyType)
│
├── infraestructure/
│   ├── adapters/                           # Repositorios SQLite
│   ├── config/
│   │   └── config-manager.ts              # Acceso a variables de entorno
│   ├── database/
│   │   └── orm/
│   │       └── prisma/
│   │           └── prisma.service.ts      # PrismaService
│   │           
│   ├── http-server/
│   │   ├── api/
│   │   │   ├── controllers/                # Controladores HTTP
│   │   │   └── dtos/                       # DTOs de entrada/salida
│
├── shared/
│   ├── filters/
│   │   └── http-exception.filter.ts       # Manejador global de errores
│   ├── logger/
│   │   └── logger.service.ts              # Logger global
│
├── prisma/
│   │   ├── migrations/
│   │   │   └── migration.sql              # Migraciones sql
│   │   └── schema.prisma                  # Esquema de base de datos
│
├── main.ts                                # Entry point de NestJS
```

---

## API Endpoints

### POST `/companies`
Registra una nueva compañía.
```json
{
  "name": "ACME Corp",
  "type": "SMALL"
}
```

### GET `/companies/registered-last-month`
Devuelve compañías registradas el último mes.


### GET `/companies/with-transfers-last-month`
Devuelve compañías con transferencias el último mes.

### SWAGGER
Swagger UI para probar los endpoints de la api desde cliente http.
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Logger Global
Ubicado en `src/shared/logger/`, exporta un `LoggerService` que puede ser inyectado en cualquier componente.

---

## Manejador Global de Errores
Define `HttpExceptionFilter` en `src/shared/filters/` y se aplica globalmente en `main.ts`.

---

## Test Unitarios
```bash
npm run test
```
---

