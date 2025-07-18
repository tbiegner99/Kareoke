FROM node:24 as build
WORKDIR /srv/package
COPY ./ui/kareoke/package-lock.json /srv/package/package-lock.json
COPY ./ui/kareoke/package.json /srv/package/package.json
RUN npm ci
COPY ./ui/kareoke /srv/package
RUN npm run build

FROM nginx:latest
COPY --from=build /srv/package/dist /etc/nginx/html
COPY ./production/nginx/nginx.conf /etc/nginx/nginx.conf
COPY  ./production/nginx/templates/* /etc/nginx/templates/
EXPOSE 80