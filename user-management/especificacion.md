dominio de libros
arquitectura
nestjs
apis
y las reglas de negocio


Libros Circulares es un proyecto que gestiona el intercambio de libros entre personas sin limitar ni que sea necesaria la devolución, por ejemplo, si la persona A es dueña de "El Resplandor" de Stephen King y se la presta a la persona B, la persona B puede prestárselo a la persona C sin que A deje de ser propietaria. El objeto de operaciones es un ejemplar de una edición de una obra.


Un libro se crear con APIS, basándonos en servicios: book, author, copy, edition, genre, publisher. Usamos net js, y entiendo que un api es por ejemplo género, que tiene get, post y update, la lista de get obtiene un array de los generos, por el url y el codigo es 201/200, lo mismo con los otros servicios pero con algunas diferencias


los servicios:
copy-management
operation-management
user-management



findAll() --> manda todos los resultados en array

GET /genres

[
  {
    "id": 1,
    "name": "Terror"
  },
  {
    "id": 2,
    "name": "Fantasía"
  }
]


findOne() --> devuelve solo uno con el id en un link

GET /genres/4829920

create() --> crea con post
update() --> updatea en base al id y lo busca en el link
remove() --> devuelve todos menos el buscado


prompteado:
"Cada recurso del dominio, como genre, author, edition o copy, puede tener un módulo en NestJS. El controller expone endpoints HTTP y el service implementa las operaciones. findAll() devuelve una colección, findOne(id) obtiene un elemento, create() crea uno nuevo, update(id) modifica uno existente y remove(id) elimina uno. Las reglas específicas de Libros Circulares, como la transferencia de ejemplares sin cambio de propietario, se implementan adicionalmente en la lógica de negocio."


- Nombrar los servicios:
    copy-management:
    gestiona la información de libros, ediciones y ejemplares físicos.

    operation-management:
    gestiona las operaciones de circulación o transferencia de ejemplares.

    user-management:
    gestiona la información de los usuarios del sistema.

- Contexto general: 
    Libros Circulares es un proyecto que gestiona el intercambio de libros entre personas sin limitar ni que sea necesaria la devolución, por ejemplo, si la persona A es dueña de "El Resplandor" de Stephen King y se la presta a la persona B, la persona B puede prestárselo a la persona C sin que A deje de ser propietaria. El objeto de operaciones es un ejemplar de una edición de una obra.

- Contexto general de este servicio:
    Este servicio se encarga de gestionar las comunidades, viendo si es posible (a través de)


- Restricciones técnicas
- Especificación de este servicio
    * Entidades a modelar
    * Operaciones permitidas-flujos
        Por cada operación o flujo --> verboHTTP que vamos a usar, json de entrada y salida, código http y que debería hacer el sistema en cada caso.

        post, persona (ruta), nombre, dni ¿qué pasa si el dni es existente (caso borde)?

    * Casos bordes


    verificar si las operaciones están cerradas en la comunidad (cuando hay 3 y quiere ser parte de otra) ¿cuál endpoint?
    a dónde voy a hacer una consulta (qué endpoint?), 