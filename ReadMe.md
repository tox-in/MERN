npm install express dotenv cors helmet winston bcrypt jsonwebtoken prisma @prisma/client zod
npm i express-rate-limit swagger-ui-express swagger-jsdoc

npm install -D typescript ts-node @types/node @types/express @types/cors @types/helmet @types/bcrypt @types/jsonwebtoken nodemon

npx tsc --init
npx prisma init --datasource-provider postgresql

*prisma generate
*prisma migrate dev
*prisma format


JS
===
npm i @prisma/client bcrypt cors dotenv express express-rate-limit helmet joi jsonwebtoken morgan nodemailer swagger-ui-express swagger-ui-express winston zod

npm i -D jest nodemon prisma supertest