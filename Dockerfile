# Download Docker image, Node.js running on Alpine
FROM node:alpine

# Make an app directory to hold the server files.
RUN mkdir /app

# Set the working directory to app.
WORKDIR /app
RUN mkdir uploads

COPY ./package.json /app/package.json
RUN npm install

COPY .env /app/.env
COPY app.ts /app/app.ts
COPY tsconfig.json /app/tsconfig.json
COPY web /app/web
COPY test /app/test
COPY test.jpg /app/test.jpg

RUN ls

RUN npm run build

# Expose port 80
EXPOSE 80

# Start the server.
CMD npx nodemon dist/app.js
