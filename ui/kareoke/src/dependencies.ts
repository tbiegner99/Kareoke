/**
 * Dependencies Configuration
 *
 * This file centralizes all dependency injection and wiring for the application.
 * It provides a single place to configure and manage all services, datasources,
 * and other dependencies used throughout the app.
 */

import { io, Socket } from 'socket.io-client';
import { SongDatasource } from './domains/songs/datasource';
import { SongService } from './domains/songs/service';
import { RoomDatasource } from './domains/room/datasource';
import { PlaylistDatasource } from './domains/playlist/datasource';
import { PlaylistService } from './domains/playlist/service';
import { RoomService } from './domains/room/service';

// API Configuration
const API_BASE_URL = process.env.BASE_URL || '/api/kareoke';

// Socket.IO connection
const SOCKET_URL = '/';
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  path: '/kareoke/socket.io',
  transports: ['websocket'],
});

/**
 * Datasource instances
 */
export const datasources = {
  songs: new SongDatasource(API_BASE_URL),
  room: new RoomDatasource(socket),
  playlist: new PlaylistDatasource(API_BASE_URL),
};

/**
 * Service instances
 */
export const services = {
  songs: new SongService(datasources.songs),
  playlist: new PlaylistService(datasources.playlist),
  rooms: new RoomService(datasources.room), // Room service can be added later if needed
};

/**
 * Default dependencies object for easy injection
 */
export const dependencies = {
  datasources,
  services,
};

/**
 * Type definitions for dependency injection
 */
export type Dependencies = typeof dependencies;
export type Services = typeof services;
export type Datasources = typeof datasources;
