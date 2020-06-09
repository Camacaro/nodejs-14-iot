# A Simple IoT Platform!

Aplicacion Mono Repositorio en microservicio realtime 

  - **Plaziverse-db**: Conexion hacia la base de datos **ORM** 
  - **Plaziverse-api**: API REST, obtener datos de la db
  - **Platziver-mqtt**: servidor de comunicacion con mosca, guardar metricas 
  - **Platziverse-agent**: Clase para comunicar los agentes con el servidor mqtt
  - **Platziverse-web**: Pagina web donde se veran las metricas en tiempo real de los agentes conectados.
  - **Platziverse-utils**: Utilidades para todo el proyecto, dependencia modular.
  - **Platziverse-cli**: Aplicacion por la terminal donde se veran todas las metricas de los agentes conectados


### Levantar Aplicacion :
  - **Plaziverse-api**: 
  ```npm run start-dev ```
    http:/localhost:3000
- **Plaziverse-mqtt**: 
  ```npm run start-dev ```
    mqtt://localhost
- **Platziverse-web**:
    http:/localhost:8080

### Ejecutar Ejemplo:
 - **Plaziverse-agent**: 
    Conectar, insertar metrica y desconectar en 5s
    ``` node examples/oneAgent.js ```
    Conectar, insertar metrica hasta detener
    ``` node examples/veryAgent.js ```