import { Video } from "@vonage/video";
import {
  getRoomSession,
  rememberRoomSession
} from "./exercise-state.js";

export function registerVideoRoutes({ app, runtime }) {
  function getVideoClient() {
    const applicationId = runtime.getEnv("VONAGE_APPLICATION_ID");
    const privateKey = runtime.readPrivateKey();

    if (!applicationId || !privateKey) {
      return null;
    }

    return new Video({ applicationId, privateKey });
  }

  app.get("/api/session", async (req, res) => {
    const video = getVideoClient();
    if (!video) {
      res.status(503).json({
        error: "missing_credentials",
        message: "Run npm run setup-credentials first."
      });
      return;
    }

    const roomName = String(req.query.room || "observability-room");
    let sessionId = getRoomSession(roomName);

    try {
      if (!sessionId) {
        const session = await video.createSession({ mediaMode: "routed" });
        sessionId = session.sessionId;
        rememberRoomSession(roomName, sessionId);
      }

      res.json(createClientCredentials(video, runtime, sessionId));
    } catch (error) {
      res.status(500).json({
        error: "session_create_failed",
        message: error.message
      });
    }
  });

  app.get("/api/pre-call/session", async (_req, res) => {
    const video = getVideoClient();
    if (!video) {
      res.status(503).json({
        error: "missing_credentials",
        message: "Run npm run setup-credentials first."
      });
      return;
    }

    try {
      const session = await video.createSession({ mediaMode: "routed" });
      res.json(createClientCredentials(video, runtime, session.sessionId));
    } catch (error) {
      res.status(500).json({
        error: "test_session_create_failed",
        message: error.message
      });
    }
  });

  app.post("/callbacks/video", (req, res) => {
    console.log("Video callback:", req.body.type || req.body.event || "event");
    res.sendStatus(204);
  });
}

function createClientCredentials(video, runtime, sessionId) {
  return {
    applicationId: runtime.getEnv("VONAGE_APPLICATION_ID"),
    sessionId,
    token: video.generateClientToken(sessionId, { role: "publisher" })
  };
}
