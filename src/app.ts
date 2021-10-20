import cors from "cors";
import compress from "compression";
import helmet from "helmet";

import feathers from "@feathersjs/feathers";
import configuration from "@feathersjs/configuration";
import express from "@feathersjs/express";
import socketio from "@feathersjs/socketio";

import type { Application } from "./types.d";

import logger from "./utils/logger";
import middleware from "./middleware";
import channels from "./channels";
import services from "./services";
import appHooks from "./app.hooks";
import authentication from "./authentication";

const app: Application = express(feathers());

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure other middleware
app.configure(middleware);
app.configure(authentication);

// Set up our services
app.configure(services);

// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

export default app;
