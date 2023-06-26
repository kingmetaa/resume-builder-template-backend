import resolvers from "../src/app/resolvers/index";
import prisma from "../src/prisma-client";
import bcrypt from "bcrypt";

describe("deleteUser mutation", () => {
  beforeEach(async () => {
    // Add test data to the database
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        id: 3,
        name: "John Doe 3",
        email: "johndoe3@example.com",
        password: hashedPassword,
        age: 25,
      },
    });
  });

  it("should delete a user", async () => {
    const userToDelete = await prisma.user.findUnique({
      where: {
        email: "johndoe3@example.com",
      },
    });

    if (userToDelete) {
    }
    const result = await resolvers.Mutation.deleteUser(null, {
      id: 3,
    });

    expect(result).toHaveProperty("id");
    expect(result.name).toEqual("John Doe 3");
    expect(result.email).toEqual("johndoe3@example.com");
    expect(result.age).toEqual(25);

    // Verify that the user has been deleted
    const deletedUser = await prisma.user.findUnique({
      where: {
        email: "johndoe3@example.com",
      },
    });
    expect(deletedUser).toBeNull();
  });

  afterEach(async () => {
    // Remove all data from the database after each test
    await prisma.user.deleteMany();
  });
});
