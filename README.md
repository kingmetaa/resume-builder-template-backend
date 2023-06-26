## Get Started

Clone the project

```
git clone git@github.com:kingmetaa/resume-builder-template-backend.git
```

You will need to setup some of environment variables according to your local

```
cp .env.example .env
```

Edit .env to match your environment, and after you're done, run this command:
You will need to create database using postgres, using the same name as the one in .env

```
npm install
npx prisma migrate dev
npm run start:dev
```

To run testing you might need to create separate DB, and change prisma DB_URL pointing to the "TESTING_DB"

```
npx jest --runInBand
```

NB: Image uploaded is stored locally under '/uploads/ folder
