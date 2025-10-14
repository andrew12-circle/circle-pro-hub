import { z } from "zod";

// Sign up request
export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;

// Sign in request
export const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignInRequest = z.infer<typeof SignInRequestSchema>;

// OAuth provider
export const OAuthProviderSchema = z.enum(["google", "github", "gitlab", "linkedin_oidc"]);

export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

// Auth user
export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

// Auth result
export const AuthResultSchema = z.object({
  user: AuthUserSchema.nullable(),
  session: z.any().nullable(),
  error: z.string().optional(),
});

export type AuthResult = z.infer<typeof AuthResultSchema>;
