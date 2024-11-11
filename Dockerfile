FROM node:20.12.0-alpine3.19

# Declare build arguments
ARG PORT
ARG CLIENTSIDE_URL
ARG REDIS_HOST

WORKDIR /usr/app/

COPY package.json package-lock.json ./

COPY src ./src

RUN npm ci

# Set environment variables for the running container 
ENV PORT=$PORT
ENV CLIENTSIDE_URL=$CLIENTSIDE_URL
ENV REDIS_HOST=$REDIS_HOST

CMD ["npm", "run" ,"dev"]

 