FROM node:24 as build
WORKDIR /srv/package
COPY ./ui/kareoke /srv/package
RUN npm ci
RUN npm run build

FROM nginx:latest
COPY --from=build /srv/package/dist /etc/nginx/html
COPY ./production/nginx/nginx.conf /etc/nginx/nginx.conf
COPY  ./production/nginx/templates/* /etc/nginx/templates/
EXPOSE 80