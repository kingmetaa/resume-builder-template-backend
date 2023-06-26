/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { PrismaClient, WorkExperience, User } from "@prisma/client";
import { hash } from "bcrypt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const secret = "your-secret-key";

interface UserLoginResult {
  user: User;
  token: string;
}

const resolvers = {
  Query: {
    getAllUsers: async () => {
      const users = await prisma.user.findMany({
        include: {
          workExperience: true,
        },
      });
      return users;
    },

    getUser: async (_parent: unknown, { id }: { id: number }) => {
      const users = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          workExperience: true,
        },
      });
      return users;
    },

    getAllExperiences: async () => {
      const experiences = await prisma.workExperience.findMany();
      return experiences;
    },

    getExperience: async (_parent: unknown, { id }: { id: number }) => {
      const experience = await prisma.workExperience.findUnique({
        where: {
          id,
        },
      });
      return experience;
    },
  },
  Mutation: {
    register: async (_parent: any, { name, email, password, age }: User) => {
      try {
        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password: hashedPassword,
            age: age,
          },
        });
        return newUser;
      } catch (err) {
        console.log(err);
        throw new Error("Error registering user");
      }
    },

    login: async (_parent: any, { email, password }: User): Promise<UserLoginResult> => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          throw new Error("Email not found");
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }
        const token = jwt.sign({ userId: user.id }, secret);
        console.log(token, "token");
        return { user, token };
      } catch (err) {
        console.log(err);
        throw new Error("Error logging in");
      }
    },

    createUser: async (_: any, { name, email, password, age }: User) => {
      const newUser = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: password,
          age: age,
        },
      });
      return newUser;
    },

    updateUser: async (_: any, { id, name, email, password, age, profilePicture }: User) => {
      try {
        const updatedUser = await prisma.user.update({
          where: {
            id,
          },
          data: {
            name,
            email,
            password,
            age,
            profilePicture,
          },
        });
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error("User not found");
      }
    },

    deleteUser: async (_: any, { id }: { id: number }) => {
      await prisma.workExperience.deleteMany({
        where: {
          userId: id,
        },
      });
      const deletedUser = await prisma.user.delete({
        where: {
          id,
        },
      });
      return deletedUser;
    },

    updateProfilePicture: async (_: any, { id, profilePicture }: User) => {
      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          profilePicture,
        },
      });
      return updatedUser;
    },

    createExperience: async (
      _: any,
      { userId, company, companyLogo, startDate, endDate, jobTitle, description }: WorkExperience
    ) => {
      const newExperience = await prisma.workExperience.create({
        data: {
          company,
          companyLogo,
          startDate,
          endDate,
          jobTitle,
          description,
          userId,
        },
      });
      return newExperience;
    },

    updateExperience: async (
      _: any,
      {
        id,
        userId,
        company,
        companyLogo,
        startDate,
        endDate,
        jobTitle,
        description,
      }: WorkExperience
    ) => {
      const updatedExperience = await prisma.workExperience.update({
        where: {
          id,
        },
        data: {
          userId,
          company,
          companyLogo,
          startDate,
          endDate,
          jobTitle,
          description,
        },
      });
      return updatedExperience;
    },

    deleteExperience: async (_: any, { id }: { id: number }) => {
      const deletedExperience = await prisma.workExperience.delete({
        where: {
          id,
        },
      });
      return deletedExperience;
    },
  },
};

export default resolvers;
