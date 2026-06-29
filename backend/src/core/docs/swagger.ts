import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Chicken Farm Management API",
    version: "1.0.0",
    description: "API documentation for Chicken Farm Management backend.",
  },
  servers: [
    { url: "http://localhost:9000", description: "Local development server" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      AdminLoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@company.com" },
          password: { type: "string", example: "StrongPassword123!" },
        },
      },
      AdminForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "admin@company.com" },
        },
      },
      AdminResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "newPassword"],
        properties: {
          email: { type: "string", format: "email", example: "admin@company.com" },
          otp: { type: "string", pattern: "^\\d{6}$", example: "482913" },
          newPassword: { type: "string", minLength: 8, example: "NewStrongPass1!" },
        },
      },
      CreateAdminUserRequest: {
        type: "object",
        required: ["email", "password", "name", "roleId"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          name: { type: "string" },
          roleId: { type: "string", format: "uuid" },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              message: { type: "string", example: "Invalid credentials" },
              code: { type: "string", example: "AUTH_INVALID" },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Admin Auth", description: "Company admin authentication APIs" },
    {
      name: "Admin users",
      description: "RBAC-protected company admin user and role listing APIs",
    },
  ],
  paths: {
    "/api/v1/admin/auth/login": {
      post: {
        tags: ["Admin Auth"],
        summary: "Admin login",
        description: "Authenticates company admin and returns JWT access token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminLoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    admin: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        name: { type: "string" },
                        mobileNumber: { type: "string", nullable: true },
                        role: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            name: { type: "string" },
                            code: { type: "string" },
                            permissions: { type: "object", additionalProperties: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/auth/forgot-password": {
      post: {
        tags: ["Admin Auth"],
        summary: "Request password reset OTP",
        description:
          "Sends a time-limited verification code to the admin email when the account exists and is active. Response message is the same whether or not the email is registered (anti-enumeration).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminForgotPasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Request accepted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/auth/reset-password": {
      post: {
        tags: ["Admin Auth"],
        summary: "Reset password with OTP",
        description:
          "Sets a new password after verifying the emailed 6-digit code. Invalid email, code, or expiry returns a generic error.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminResetPasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": {
            description: "Invalid or expired code, or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/auth/me": {
      get: {
        tags: ["Admin Auth"],
        summary: "Get current admin profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current admin profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    admin: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        name: { type: "string" },
                        mobileNumber: { type: "string", nullable: true },
                        role: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            name: { type: "string" },
                            code: { type: "string" },
                            permissions: { type: "object", additionalProperties: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/roles": {
      get: {
        tags: ["Admin users"],
        summary: "List admin roles (for assignee picker)",
        security: [{ bearerAuth: [] }],
        description:
          "Requires permission `auth.admin.role.read`. SUPER_ADMIN role seeded with `[\"*\"]` has all permissions.",
        responses: {
          "200": {
            description: "Role list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    roles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                          code: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden (missing permission)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/users": {
      post: {
        tags: ["Admin users"],
        summary: "Create company admin user",
        security: [{ bearerAuth: [] }],
        description: "Requires permission `auth.admin.user.create`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAdminUserRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Admin created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    admin: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        name: { type: "string" },
                        mobileNumber: { type: "string", nullable: true },
                        role: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            name: { type: "string" },
                            code: { type: "string" },
                            permissions: {},
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation or unknown role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden (missing permission)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export function registerSwaggerDocs(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
