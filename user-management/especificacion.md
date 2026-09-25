# Especificación de `user-management`

## 1. Contexto general

**Libros Circulares** es un sistema que gestiona la circulación de ejemplares físicos de libros entre personas.

El objeto de las operaciones es un **ejemplar de una edición de una obra**.

Un ejemplar puede circular entre distintas personas sin necesidad de regresar inmediatamente a su propietario original. Por ejemplo, si A es propietaria de un ejemplar y se lo presta a B, B puede posteriormente prestárselo a C sin que A deje de ser propietaria.

Las operaciones sobre ejemplares son:

- préstamo;
- devolución;
- cesión de propiedad;
- baja del ejemplar.

Estas operaciones pertenecen a `operation-management`.

El sistema está dividido principalmente en:

- `copy-management`: obras, autores, géneros, editoriales, ediciones y ejemplares;
- `operation-management`: operaciones sobre ejemplares;
- `user-management`: personas, contactos, comunidades y pertenencia a comunidades.

Esta especificación corresponde únicamente a `user-management`.

---

# 2. Restricciones técnicas

El proyecto utiliza:

- TypeScript;
- NestJS;
- API REST;
- arquitectura por capas;
- persistencia únicamente en memoria.

No se utilizará base de datos.

No se deben generar tests.

No se deben agregar entidades, endpoints, dependencias o cambios arquitectónicos que no estén contemplados en esta especificación.

No se deben modificar archivos fuera de `user-management` salvo que sea solicitado expresamente.

Los identificadores `userId` y `communityId` se generan automáticamente utilizando el número positivo disponible más cercano.

Ejemplo:

```text
IDs existentes: 1, 2, 4
Nuevo ID: 3
```

---

# 3. Responsabilidad de `user-management`

El servicio deberá permitir:

- registrar personas;
- consultar personas;
- modificar personas;
- eliminar personas;
- gestionar sus datos de contacto;
- crear comunidades;
- consultar comunidades;
- modificar comunidades;
- eliminar comunidades;
- asociar personas con comunidades;
- activar e inactivar membresías;
- eliminar una persona de una comunidad.

La lógica interna de préstamos, devoluciones, cesiones y bajas de ejemplares queda fuera del alcance de este servicio.

---

# 4. Integraciones externas

## 4.1 RENAPER

Durante el registro de una persona deben validarse:

- DNI;
- nombre;
- apellido.

Para esta implementación en memoria, RENAPER puede representarse mediante un servicio externo simulado.

Debe poder distinguir al menos:

```text
Datos válidos
Datos inválidos
Servicio no disponible
```

Si posteriormente se modifica el DNI, nombre o apellido, los datos resultantes deben validarse nuevamente.

---

## 4.2 `operation-management`

`user-management` debe poder consultar si una persona posee operaciones abiertas.

Debe existir una funcionalidad equivalente a:

```typescript
hasOpenOperations(userId, communityId?)
```

Si se proporciona `communityId`, se verifican únicamente las operaciones de esa persona dentro de esa comunidad.

Sin `communityId`, se verifican todas las operaciones correspondientes a la persona.

También debe poder determinarse si existen operaciones abiertas asociadas a una comunidad antes de eliminarla.

---

# 5. Entidades

## 5.1 User

```typescript
export class User {
  userId: number;

  name: string;

  lastName: string;

  email?: string;

  phone?: string;

  birthDate: Date;

  dni: string;

  contactUserId?: number;

  communities: CommunityMembership[] = [];
}
```

### Reglas

- `userId` se genera automáticamente y no puede modificarse.
- El DNI debe ser único.
- Toda persona debe tener acceso a al menos un medio de contacto.
- El contacto puede ser propio (`email` o `phone`) o provenir de otra persona mediante `contactUserId`.
- Si se utiliza `contactUserId`, debe referenciar a una persona existente con al menos un email o teléfono.
- Cuando una persona sea menor de edad, `contactUserId` será obligatorio.

---

## 5.2 Community

```typescript
export class Community {
  communityId: number;
  name: string;
  members: CommunityMembership[] = [];
}
```

### Reglas

- `communityId` se genera automáticamente y no puede modificarse.
- `name` es obligatorio.
- No pueden existir dos comunidades con el mismo nombre.

---

## 5.3 CommunityMembership

```typescript
export class CommunityMembership {
  userId: number;
  communityId: number;
  active: boolean;
}
```

Representa la pertenencia de una persona a una comunidad.

Una membresía puede estar:

```text
active = true   → activa
active = false  → inactiva
```

Una persona no puede tener dos membresías correspondientes a la misma comunidad.

Una nueva membresía se crea inicialmente como:

```typescript
active = false;
```

---

# 6. Reglas de comunidades

Una persona puede pertenecer como máximo a **3 comunidades simultáneamente**, independientemente de si alguna de sus membresías está activa o inactiva.

Por ejemplo:

```text
Comunidad A → activa
Comunidad B → activa
Comunidad C → inactiva
```

La persona ya pertenece a 3 comunidades y no puede asociarse a una cuarta.

Si desea ingresar a una nueva comunidad, primero deberá salir de una de las anteriores.

Para salir de una comunidad:

1. no debe tener operaciones abiertas en esa comunidad;
2. si tiene operaciones abiertas, primero deben cerrarse;
3. una vez cerradas, podrá inactivarse si se encontraba activa;
4. posteriormente podrá eliminarse la membresía;
5. recién entonces podrá asociarse a una nueva comunidad.

No es necesario cerrar operaciones de las otras comunidades, únicamente de aquella de la que desea salir.

---

# 7. Estado activo e inactivo

`active` representa el estado de la persona dentro de la comunidad.

Una persona puede:

```text
pertenecer y estar activa;
pertenecer y estar inactiva;
no pertenecer.
```

Tener operaciones abiertas y estar activo son conceptos diferentes.

Sin embargo, una persona **no puede ser inactivada ni eliminada de una comunidad mientras tenga operaciones abiertas dentro de ella**.

Las operaciones sobre libros solo pueden realizarse entre personas activas dentro de una misma comunidad.

---

# 8. Registrar una persona

## Endpoint

```http
POST /users
```

## Entrada

```json
{
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "phone": "1122334455",
  "birthDate": "2000-05-10",
  "dni": "40123456",
  "contactUserId": 2
}
```

`email`, `phone` y `contactUserId` son opcionales individualmente, pero debe existir al menos una forma válida de contacto.

## Validaciones

- DNI no utilizado previamente.
- DNI, nombre y apellido válidos según RENAPER.
- Debe existir al menos un contacto válido.
- Si existe `contactUserId`, la persona referenciada debe existir.
- La persona referenciada debe tener email o teléfono.
- Si se trata de una persona menor, debe existir `contactUserId`.
- Debe generarse correctamente un `userId`.

## Éxito

```http
201 Created
```

```json
{
  "userId": 5
}
```

## Errores principales

```text
DNI repetido                    → 409 Conflict
Datos inválidos                 → 400 Bad Request
Contacto inexistente            → 404 Not Found
RENAPER rechaza identidad        → 422 Unprocessable Entity
RENAPER no disponible            → 503 Service Unavailable
```

---

# 9. Obtener personas

## Todas

```http
GET /users
```

Respuesta:

```http
200 OK
```

Devuelve un array de personas.

## Una persona

```http
GET /users/:userId
```

Respuesta correcta:

```http
200 OK
```

Si no existe:

```http
404 Not Found
```

---

# 10. Modificar una persona

## Endpoint

```http
PATCH /users/:userId
```

Solo deben modificarse los campos recibidos.

Ejemplo:

```json
{
  "phone": "1199999999"
}
```

Los demás valores permanecen sin cambios.

## Validaciones

- `userId` no puede modificarse.
- Si cambia el DNI, debe continuar siendo único.
- Si cambia DNI, nombre o apellido, los datos resultantes deben validarse mediante RENAPER.
- Después de modificar datos de contacto, la persona debe continuar teniendo al menos un medio válido.
- Si cambia `contactUserId`, la nueva persona debe existir y poseer email o teléfono.

## Éxito

```http
200 OK
```

---

# 11. Eliminar una persona

## Endpoint

```http
DELETE /users/:userId
```

## Validaciones

- La persona debe existir.
- No debe tener operaciones abiertas.

La existencia de operaciones abiertas se consulta a `operation-management`.

## Comportamiento

Cuando la eliminación es válida:

- se elimina la persona;
- se eliminan sus membresías;
- también se eliminan dichas membresías de las comunidades correspondientes.

## Éxito

```http
204 No Content
```

## Errores

```text
Persona inexistente     → 404 Not Found
Operaciones abiertas    → 409 Conflict
```

---

# 12. Crear comunidad

## Endpoint

```http
POST /communities
```

## Entrada

```json
{
  "name": "Comunidad Palermo"
}
```

La comunidad se crea inicialmente sin personas.

## Validaciones

- nombre obligatorio;
- nombre no utilizado por otra comunidad;
- generación correcta de `communityId`.

## Éxito

```http
201 Created
```

```json
{
  "communityId": 3
}
```

Nombre repetido:

```http
409 Conflict
```

---

# 13. Obtener comunidades

## Todas

```http
GET /communities
```

Respuesta:

```http
200 OK
```

## Una comunidad

```http
GET /communities/:communityId
```

Respuesta correcta:

```http
200 OK
```

Si no existe:

```http
404 Not Found
```

---

# 14. Modificar comunidad

## Endpoint

```http
PATCH /communities/:communityId
```

El atributo modificable es:

```text
name
```

## Validaciones

- la comunidad debe existir;
- el nuevo nombre debe ser único;
- `communityId` no puede modificarse.

## Éxito

```http
200 OK
```

---

# 15. Eliminar comunidad

## Endpoint

```http
DELETE /communities/:communityId
```

## Validaciones

- la comunidad debe existir;
- no debe tener miembros activos;
- no debe tener operaciones abiertas.

## Comportamiento

Al eliminar la comunidad:

- se elimina la comunidad;
- se eliminan también las membresías inactivas que todavía la referencien;
- dichas membresías se eliminan de `user.communities`.

## Éxito

```http
204 No Content
```

## Errores

```text
Comunidad inexistente        → 404 Not Found
Miembros activos             → 409 Conflict
Operaciones abiertas         → 409 Conflict
```

---

# 16. Asociar una persona a una comunidad

## Endpoint

```http
POST /communities/:communityId/members/:userId
```

## Validaciones

- la persona debe existir;
- la comunidad debe existir;
- no debe existir ya una membresía entre ambos;
- la persona debe pertenecer actualmente a menos de 3 comunidades.

## Comportamiento

Se crea:

```typescript
{
  userId,
  communityId,
  active: false
}
```

La membresía debe almacenarse tanto en:

```typescript
user.communities
```

como en:

```typescript
community.members
```

## Éxito

```http
201 Created
```

## Errores

```text
Persona inexistente               → 404 Not Found
Comunidad inexistente             → 404 Not Found
Membresía existente               → 409 Conflict
Ya pertenece a 3 comunidades      → 409 Conflict
```

---

# 17. Activar una persona en una comunidad

## Endpoint

```http
PATCH /communities/:communityId/members/:userId/activate
```

## Validaciones

- persona existente;
- comunidad existente;
- membresía existente;
- membresía actualmente inactiva.

## Comportamiento

```typescript
membership.active = true;
```

## Éxito

```http
200 OK
```

## Errores

```text
Recurso inexistente        → 404 Not Found
Ya se encuentra activa     → 409 Conflict
```

---

# 18. Inactivar una persona en una comunidad

## Endpoint

```http
PATCH /communities/:communityId/members/:userId/inactivate
```

## Validaciones

- persona existente;
- comunidad existente;
- membresía existente;
- membresía actualmente activa;
- ninguna operación abierta dentro de esa comunidad.

La última validación debe realizarse consultando a `operation-management`.

## Comportamiento

```typescript
membership.active = false;
```

La persona continúa perteneciendo a la comunidad.

## Éxito

```http
200 OK
```

## Errores

```text
Recurso inexistente          → 404 Not Found
Ya se encuentra inactiva     → 409 Conflict
Operaciones abiertas         → 409 Conflict
```

---

# 19. Eliminar una persona de una comunidad

## Endpoint

```http
DELETE /communities/:communityId/members/:userId
```

## Validaciones

- persona existente;
- comunidad existente;
- membresía existente;
- membresía inactiva;
- ninguna operación abierta en esa comunidad.

## Comportamiento

Se elimina la membresía de:

```typescript
user.communities
```

y de:

```typescript
community.members
```

La persona deja de pertenecer a esa comunidad.

## Éxito

```http
204 No Content
```

## Errores

```text
Recurso inexistente          → 404 Not Found
Membresía activa             → 409 Conflict
Operaciones abiertas         → 409 Conflict
```

---

# 20. Flujo para ingresar a una cuarta comunidad

Si una persona ya pertenece a:

```text
Comunidad A
Comunidad B
Comunidad C
```

y quiere ingresar a:

```text
Comunidad D
```

el sistema debe rechazar inicialmente la asociación.

La persona debe elegir una comunidad anterior de la cual salir.

Por ejemplo:

```text
Quiere salir de B
```

Flujo:

```text
1. Consultar si tiene operaciones abiertas en B.

2. Si tiene operaciones abiertas:
   no puede salir hasta cerrarlas.

3. Cuando ya no tenga operaciones abiertas:
   si está activa, se inactiva.

4. Se elimina su membresía de B.

5. Ahora pertenece solamente a A y C.

6. Puede asociarse a D.
```

Resultado:

```text
Antes:
A
B
C

Después:
A
C
D
```

---

# 21. Casos conflictivos principales

La operación debe fallar cuando:

- el DNI ya pertenece a otra persona;
- RENAPER rechaza los datos;
- RENAPER no está disponible;
- una persona queda sin ningún medio de contacto válido;
- `contactUserId` referencia a una persona inexistente;
- se intenta crear una comunidad con un nombre existente;
- se intenta asociar una persona inexistente;
- se intenta asociar a una comunidad inexistente;
- ya existe la membresía;
- una persona intenta pertenecer a una cuarta comunidad;
- se intenta inactivar una membresía con operaciones abiertas;
- se intenta eliminar una membresía con operaciones abiertas;
- se intenta eliminar una persona con operaciones abiertas;
- se intenta eliminar una comunidad con miembros activos;
- se intenta eliminar una comunidad con operaciones abiertas.

---

# 22. Resumen de endpoints

| Método | Endpoint | Función |
|---|---|---|
| POST | `/users` | Registrar persona |
| GET | `/users` | Obtener personas |
| GET | `/users/:userId` | Obtener persona |
| PATCH | `/users/:userId` | Modificar persona |
| DELETE | `/users/:userId` | Eliminar persona |
| POST | `/communities` | Crear comunidad |
| GET | `/communities` | Obtener comunidades |
| GET | `/communities/:communityId` | Obtener comunidad |
| PATCH | `/communities/:communityId` | Modificar comunidad |
| DELETE | `/communities/:communityId` | Eliminar comunidad |
| POST | `/communities/:communityId/members/:userId` | Asociar persona |
| PATCH | `/communities/:communityId/members/:userId/activate` | Activar membresía |
| PATCH | `/communities/:communityId/members/:userId/inactivate` | Inactivar membresía |
| DELETE | `/communities/:communityId/members/:userId` | Eliminar membresía |

---

# 23. Regla central

Una persona puede:

```text
pertenecer y estar activa;
pertenecer y estar inactiva;
no pertenecer a la comunidad.
```

Puede pertenecer como máximo a **3 comunidades simultáneamente**.

Estar inactiva **no significa haber salido de la comunidad**.

Para dejar de pertenecer a una comunidad debe eliminarse su `CommunityMembership`.

Si tiene operaciones abiertas dentro de esa comunidad, primero deberán cerrarse.

Solo después podrá salir de esa comunidad y ocupar ese lugar asociándose a una nueva.