# Stage 0, "build-stage", based on Node.js, to build and compile the frontend

FROM node:12.18.0 as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

ARG configuration=production

RUN npm run build -- --output-path=./dist/out --configuration $configuration


FROM nginx

#copy dist folder to nginx

COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html

# Copy the default nginx.conf

COPY /nginx.conf /etc/nginx/conf.d/default.conf

