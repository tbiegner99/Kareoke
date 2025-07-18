FROM node:24 as build
WORKDIR /srv/package
COPY ./backend/kareoke /srv/package
RUN npm ci
RUN npm run build


FROM node:24
WORKDIR /srv/package
COPY --from=build /srv/package/build /srv/package
COPY --from=build /srv/package/node_modules /srv/package/node_modules

EXPOSE 8080
CMD node ./app.js