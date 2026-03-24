import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: async (_request: HttpRequest): Promise<HttpResponseInit> => {
    return {
      status: 200,
      jsonBody: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
