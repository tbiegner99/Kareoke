export const BASE_URL = '/kareoke/app';

export const Urls = {
    baseUrl: BASE_URL,
    home: `${BASE_URL}/`,
    room: (roomId:string) => `${BASE_URL}/room/${roomId}`,
    songs: (roomId:string) => `${BASE_URL}/room/${roomId}/songs`,
};
