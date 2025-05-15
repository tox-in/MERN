npm install express dotenv cors helmet winston bcrypt jsonwebtoken prisma @prisma/client zod

npm install -D typescript ts-node @types/node @types/express @types/cors @types/helmet @types/bcrypt @types/jsonwebtoken nodemon

npx tsc --init
npx prisma init --datasource-provider postgresql

*prisma generate
*prisma migrate dev
*prisma format