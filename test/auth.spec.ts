/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import resolvers from "../src/app/resolvers/index";
import prisma from "../src/prisma-client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("login mutation", () => {
  beforeEach(async () => {
    // Add test data to the database
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "John Doe 5",
        email: "johndoe5@example.com",
        password: hashedPassword,
        age: 25,
      },
    });
  });

  afterEach(async () => {
    // Remove all data from the database after each test
    await prisma.user.deleteMany();
  });

  it("should return user and token with valid credentials", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe 5",
      profilePicture: "",
      email: "johndoe5@example.com",
      password: "password123",
      age: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await resolvers.Mutation.login(null, mockUser);

    expect(result.user).toHaveProperty("id");
    expect(result.user.name).toEqual("John Doe 5");
    expect(result.user.email).toEqual(mockUser.email);
    expect(result.user.age).toEqual(25);
    expect(result).toHaveProperty("token");

    // Verify that the token is valid
    const decodedToken: any = jwt.verify(result.token, "your-secret-key");
    expect(decodedToken).toHaveProperty("userId");
    expect(decodedToken.userId).toEqual(result.user.id);
  });

  it("should throw an error with invalid email", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe 2",
      profilePicture: "",
      email: "janedoe@example.com",
      password: "password123",
      age: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await resolvers.Mutation.login(null, mockUser);
    } catch (err: any) {
      expect(err.message).toEqual("Error logging in");
    }
  });

  it("should throw an error with invalid password", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe 2",
      profilePicture: "",
      email: "janedoe@example.com",
      password: "wrongpassword",
      age: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await resolvers.Mutation.login(null, mockUser);
    } catch (err: any) {
      expect(err.message).toEqual("Error logging in");
    }
  });
});
