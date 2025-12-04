import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SISTEMA DE API",
      version: "1.0.0",
      description: "API para gerenciar processos",
    },
  },
  apis: ["./src/docs/*.yaml"], // <-- arquivos onde estarão as anotações
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};