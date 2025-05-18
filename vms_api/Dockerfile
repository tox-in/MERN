FROM node:18-alpine

#Working directory
WORKDIR /usr/src/app

# Copy package.json first to utilize Docker cache
COPY package*.json ./

#Install Prettier (For our package's build function)
RUN npm install prettier -g

#Install dependencies
RUN npm install

# Copy the rest of the application code after installing dependencies
COPY . .

# Copy Prisma files after the dependencies have been installed
COPY ./src/prisma ./src/prisma

# Check if upload directories exists, create them if they don't and give permissions

RUN npm prisma:all

#Build the application
RUN npm build

EXPOSE 3011

CMD ["npm", "dev"]

#COMMANDS
#--------
#    docker ps -a 
#    docker images
#    cd ..
#   docker build -t .\vms_api\ -t 

#use git for removing the submodulity
# rm -rf vms_api/.git #Bash
#Remove-Item -Recurse -Force vms_api\.git #powershell
#git rm --cached -r vms_api
