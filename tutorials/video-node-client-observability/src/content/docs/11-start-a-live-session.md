---
title: Start a Live Session
description: Create a routed Video API session with a publisher and subscriber.
---

# Start a Live Session

Select **Start session** in the monitor.

The backend uses the Video API Server SDK to create a new routed session and generate separate publisher and subscriber tokens. The prepared browser client then:

1. Connects two clients to the session.
2. Publishes an animated video source with sender statistics enabled.
3. Subscribes to that stream through the second connection.
4. Sends publisher and subscriber statistics to your backend.

The animated source avoids requesting camera or microphone access, but the media still travels through a real Video API session.

Wait until both video panels display the animation and the status confirms that telemetry is being collected.
