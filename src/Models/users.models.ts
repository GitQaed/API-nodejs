import { createHmac } from "crypto";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export const NewUserModel = z
  .object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .min(5)
      .transform((pass) =>
        createHmac("sha256", process.env.API_SECRET || "secret")
          .update(pass)
          .digest("hex")
      ),
    repeated_password: z
      .string()
      .min(5)
      .transform((pass) =>
        createHmac("sha256", process.env.API_SECRET || "secret")
          .update(pass)
          .digest("hex")
      ),
  })
  .refine((newUser) => newUser.password === newUser.repeated_password, {
    message: "Your passwords don't match",
  });

export const UserModel = z.object({
  _id: z.preprocess((id) => `${id}`, z.string()),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const UserSearchCriteriaModel = z.object({
  limit: z.number().min(2).max(100).optional().default(20),
  page: z.number().min(1).optional().default(1),
  orderBy: z
    .enum(["_id", "email", "firstname", "lastname"])
    .optional()
    .default("_id"),
  direction: z
    .enum(["asc", "desc"])
    .optional()
    .default("asc")
    .transform((dir) => ("asc" === dir ? 1 : -1)),
  email: z.string().optional(),
});

export const UserCollectionModel = z.array(UserModel);

export const UserCredentialModel = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(5)
    .transform((pass) =>
      createHmac("sha256", process.env.API_SECRET || "secret")
        .update(pass)
        .digest("hex")
    ),
});

export const UserTokenModel = z.object({
  token: z.string(),
});

export type NewUserType = z.infer<typeof NewUserModel>;
export type UserType = z.infer<typeof UserModel>;
export type UserSearchCriteriaType = z.infer<typeof UserSearchCriteriaModel>;
export type UserCollectionType = z.infer<typeof UserCollectionModel>;
export type UserCredentialType = z.infer<typeof UserCredentialModel>;
export type UserTokenType = z.infer<typeof UserTokenModel>;

export const NewUserSchema = zodToJsonSchema(NewUserModel);
export const UserSchema = zodToJsonSchema(UserModel);
export const UserSearchCriteriaSchema = zodToJsonSchema(
  UserSearchCriteriaModel
);
export const UserCollectionSchema = zodToJsonSchema(UserCollectionModel);
export const UserCredentialSchema = zodToJsonSchema(UserCredentialModel);
export const UserTokenSchema = zodToJsonSchema(UserTokenModel);
