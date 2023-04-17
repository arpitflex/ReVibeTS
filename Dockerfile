FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .
CMD [ "npm", "start" ]