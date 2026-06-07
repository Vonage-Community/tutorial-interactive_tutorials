import { Video } from "@vonage/video";
import { state, rememberRoomSession } from "./advanced-video-state.js";
import {
  getArchiveViewUrl,
  recordClientDebugEvent,
  recordLayoutPreview,
  recordPublisherDiagnostics,
  recordSignalActivity,
  recordSubscriberState,
  recordVideoCallback,
  startArchive,
  stopArchive
} from "./advanced-video-server-hooks.js";

export function registerRoutes({ app, config, runtime }) {
  const defaultRoom = config.defaultRoom || "advanced-room";

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
      res.status(503).json({ error: "missing_credentials", message: "Run npm run setup-credentials first." });
      return;
    }

    const roomName = String(req.query.room || defaultRoom);
    let sessionId = state.rooms.get(roomName);

    try {
      if (!sessionId) {
        const session = await video.createSession({ mediaMode: "routed" });
        sessionId = session.sessionId;
        rememberRoomSession(roomName, sessionId);
      }

      const token = video.generateClientToken(sessionId, { role: "moderator" });
      res.json({
        applicationId: runtime.getEnv("VONAGE_APPLICATION_ID"),
        sessionId,
        token,
        roomName
      });
    } catch (error) {
      res.status(500).json({ error: "session_create_failed", message: error.message });
    }
  });

  app.post("/callbacks/video", (req, res) => {
    try {
      recordVideoCallback(req.body);
    } catch (error) {
      console.error("Video callback handler failed:", error.message);
    }
    res.sendStatus(204);
  });

  app.post("/api/debug/client-event", (req, res) => {
    recordClientDebugEvent(req.body);
    res.json({ ok: true });
  });

  app.get("/debug/timeline", (_req, res) => {
    res.json({ timeline: state.debugTimeline });
  });

  app.post("/api/activity", (req, res) => {
    recordSignalActivity(req.body);
    res.json({ ok: true });
  });

  app.get("/activity/recent", (_req, res) => {
    res.json({ messages: state.activityMessages });
  });

  app.post("/api/diagnostics/publisher", (req, res) => {
    recordPublisherDiagnostics(req.body);
    res.json({ ok: true });
  });

  app.get("/diagnostics/publisher", (_req, res) => {
    res.json(state.publisherDiagnostics);
  });

  app.post("/api/diagnostics/subscriber", (req, res) => {
    recordSubscriberState(req.body);
    res.json({ ok: true });
  });

  app.get("/diagnostics/subscriber", (_req, res) => {
    res.json(state.subscriberDiagnostics);
  });

  app.post("/api/recordings/preview", (req, res) => {
    recordLayoutPreview(req.body);
    res.json({ ok: true, recording: state.recording });
  });

  app.get("/recordings/latest", (_req, res) => {
    res.json(state.recording);
  });

  app.post("/archive/start", async (req, res) => {
    try {
      const archive = await startArchive({ video: getVideoClient(), body: req.body, state });
      res.json(archive);
    } catch (error) {
      res.status(501).json({ error: "archive_start_not_ready", message: error.message });
    }
  });

  app.post("/archive/:archiveId/stop", async (req, res) => {
    try {
      const archive = await stopArchive({ video: getVideoClient(), archiveId: req.params.archiveId, state });
      res.json(archive);
    } catch (error) {
      res.status(501).json({ error: "archive_stop_not_ready", message: error.message });
    }
  });

  app.get("/archive/:archiveId/view", async (req, res) => {
    try {
      const url = await getArchiveViewUrl({ video: getVideoClient(), archiveId: req.params.archiveId, state });
      if (url) {
        res.redirect(url);
        return;
      }
      res.type("html").send("<p>Archive is still processing. Try again in a moment.</p>");
    } catch (error) {
      res.status(501).json({ error: "archive_view_not_ready", message: error.message });
    }
  });

  app.get("/archive/latest", (_req, res) => {
    res.json(state.latestArchive);
  });
}
