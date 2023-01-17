import { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";

import {
  UserModel,
  NewUserModel,
  UserSchema,
  NewUserSchema,
  UserSearchCriteriaSchema,
  UserCollectionSchema,
  UserCollectionModel,
  UserSearchCriteriaModel,
  UserCredentialSchema,
  UserTokenSchema,
  UserCredentialModel,
  UserTokenModel,
} from "../Models/users.models";
// import crypto from "crypto";

export async function usersRoute(app: FastifyInstance) {
  const newUserOptions = {
    schema: {
      body: NewUserSchema,
      response: {
        201: UserSchema,
      },
    },
  };

  app.post("/users", newUserOptions, async (request) => {
    const newUser = NewUserModel.parse(request.body);

    // const hashedPassword = crypto
    //   .createHash("sha1")
    //   .update(newUser.password)
    //   .digest("hex");

    const result = await app.mongo.db?.collection("users").insertOne(newUser);

    return UserModel.parse(
      await app.mongo.db?.collection("users").findOne({
        _id: result?.insertedId,
      })
    );
  });

  const userOptions = {
    schema: {
      querystring: UserSearchCriteriaSchema,
      response: { 200: UserCollectionSchema },
    },
  };

  app.get("/users", userOptions, async (request) => {
    const criterias = UserSearchCriteriaModel.parse(request.query);
    return UserCollectionModel.parse(
      await app.mongo.db
        ?.collection("users")
        .find(
          criterias.email ? { email: new RegExp(`${criterias.email}`) } : {}
        )
        .limit(criterias.limit)
        .skip((criterias.page - 1) * criterias.limit)
        .sort({ [criterias.orderBy]: criterias.direction })
        .toArray()
    );
  });

  const tokenOptions = {
    schema: {
      body: UserCredentialSchema,
      response: {
        201: UserTokenSchema,
      },
    },
  };

  app.post("/token", tokenOptions, async (request, reply) => {
    const newToken = UserCredentialModel.parse(request.body);

    const User = UserModel.parse(
      (await app.mongo.db?.collection("users").findOne({
        email: newToken.email,
        password: newToken.password,
      })) || reply.send("User doesn't exists or wrong password")
    );

    if (User.email == newToken.email && User.password == newToken.password) {
      const token = app.jwt.sign({
        email: newToken.email,
        password: newToken.password,
      });
      return UserTokenModel.parse(reply.send({ token }));
    }
  });
}
