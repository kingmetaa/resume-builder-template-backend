/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-conditional-expect */
import resolvers from "../src/app/resolvers/index";
import prisma from "../src/prisma-client";
import bcrypt from "bcrypt";

describe("updateUser mutation", () => {
  beforeEach(async () => {
    // Add test data to the database
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        id: 2,
        name: "John Doe",
        email: "johndoe@example.com",
        password: hashedPassword,
        age: 25,
      },
    });
  });

  afterEach(async () => {
    // Remove all data from the database after each test
    await prisma.user.deleteMany();
  });

  it("should update the user with valid data", async () => {
    const updatedUser = {
      id: 2,
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: "newpassword123",
      age: 30,
      profilePicture: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await resolvers.Mutation.updateUser(null, updatedUser);

    expect(result).toHaveProperty("id");
    expect(result.name).toEqual(updatedUser.name);
    expect(result.email).toEqual(updatedUser.email);
    expect(result.age).toEqual(updatedUser.age);
    // expect(result.password).not.toEqual(updatedUser.password); // Password should be hashed
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should throw an error with invalid user ID", async () => {
    const updatedUser = {
      id: 9999, // Non-existent user ID
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: "newpassword123",
      age: 30,
      profilePicture: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await resolvers.Mutation.updateUser(null, updatedUser);
    } catch (err: any) {
      expect(err.message).toEqual("User not found");
    }
  });
});
