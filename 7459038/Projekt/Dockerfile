# syntax=docker/dockerfile:1
   
FROM node:16-alpine
WORKDIR /app
COPY . .

RUN npm install
CMD ["npm", "run", "prod"]

# EXPOSE 3030
