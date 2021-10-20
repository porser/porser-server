import type { HookContext } from "@feathersjs/feathers";
import type { RealTimeConnection } from "@feathersjs/transport-commons/lib/channels/channel/base";
import type { Application } from "types.d";

const realTimeChannels = (app: Application) => {
  // If no real-time functionality has been configured do nothing
  if (typeof app.channel !== "function") return;

  app.on("connection", (connection: RealTimeConnection) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel("anonymous").join(connection);
  });

  app.on(
    "login",
    (_: unknown, { connection }: { connection: RealTimeConnection }) => {
      // connection can be undefined if there is no
      // real-time connection, e.g. when logging in via REST
      if (connection) {
        // Obtain the logged in user from the connection
        // const user = connection.user;

        // The connection is no longer anonymous, remove it
        app.channel("anonymous").leave(connection);

        // Add it to the authenticated user channel
        app.channel("authenticated").join(connection);
      }
    }
  );

  app.publish((_data: unknown, __hook: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // eslint-disable-next-line no-console
    console.log(
      "Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information."
    );

    // Publish all service events to all authenticated users
    return app.channel("authenticated");
  });
};

export default realTimeChannels;
