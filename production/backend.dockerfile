FROM node:24 as build
WORKDIR /srv/package
COPY ./backend/kareoke /srv/package
RUN npm ci
RUN npm run build


FROM node:24
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 ffmpeg \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /srv/package
COPY --from=build /srv/package/build /srv/package
COPY --from=build /srv/package/node_modules /srv/package/node_modules

EXPOSE 8080
CMD node ./app.js