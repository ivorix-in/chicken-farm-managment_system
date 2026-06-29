declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: string;
        email: string;
      };
      /** Set by requirePermission after validating JWT + RBAC against AdminRole.permissions. */
      admin?: {
        id: string;
        email: string;
        name: string;
        mobileNumber: string | null;
        isActive: boolean;
        role: {
          id: string;
          name: string;
          code: string;
          permissions: unknown;
        };
      };
    }
  }
}

export {};
