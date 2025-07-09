/**
 * Dependencies Configuration
 *
 * This file centralizes all dependency injection and wiring for the application.
 * It provides a single place to configure and manage all services, datasources,
 * and other dependencies used throughout the app.
 */

import { SongDatasource } from './domains/songs/datasource';
import { SongService } from './domains/songs/service';

// API Configuration
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

/**
 * Datasource instances
 */
export const datasources = {
  songs: new SongDatasource(API_BASE_URL),
};

/**
 * Service instances
 */
export const services = {
  songs: new SongService(datasources.songs),
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
