# ApiSeedlingTS

ApiSeedlingTS es un servidor API REST desarrollado en Node.js y TypeScript, diseñado para ofrecer una interfaz robusta y escalable para aplicaciones web. Utiliza MongoDB como sistema de gestión de bases de datos, Redis para el manejo de sesiones y tokens, y Fastify como servidor web, asegurando un rendimiento óptimo y rápida respuesta.

## Características

- **Node.js v20.12.1 y TypeScript:** Moderno y actualizado, aprovechando las últimas funcionalidades de ambos.
- **MongoDB con Mongoose:** Ofrece una solución eficaz para manejar grandes volúmenes de datos con facilidad.
- **Redis:** Utilizado para gestionar sesiones y manejar tokens invalidados.
- **Fastify:** Un servidor web eficiente y de bajo retardo, con plugins que facilitan la integración.
- **OpenAPI:** Definición clara y estructurada de endpoints usando el plugin fastify-openapi-glue.
- **AccessControl:** Gestión detallada de roles, permisos y acceso a atributos.

## Configuración

Para configurar este proyecto, asegúrate de tener instalado Node.js v20.12.1 y MongoDB, así como un servidor Redis funcionando. 

1. Clona el repositorio:
   ```bash
   git clone https://your-repository-url.com/ApiSeedlingTS.git
   cd ApiSeedlingTS

2. Instala las dependencias:
   ```bash
   npm install

3. La configuración se establece en el fichero /config/default.yml

4. 