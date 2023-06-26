import resolvers from "../src/app/resolvers/index";
import prisma from "../src/prisma-client";

describe("createUser mutation", () => {
  afterEach(async () => {
    // Remove all data from the database after each test
    await prisma.user.deleteMany();
  });

  it("should create a new user", async () => {
    const mockUser = {
      id: 10,
      name: "John Doe 10",
      profilePicture: "",
      email: "johndoe10@example.com",
      password: "password123",
      age: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await resolvers.Mutation.createUser(null, mockUser);

    expect(result).toHaveProperty("id");
    expect(result.name).toEqual(mockUser.name);
    expect(result.email).toEqual(mockUser.email);
    expect(result.age).toEqual(mockUser.age);
  });
});
