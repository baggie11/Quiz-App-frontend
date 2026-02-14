import React, { useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { type RoomOptions } from "livekit-client";

function SimpleTTS() {
  const [token, setToken] = useState(""); // JWT from your server
  const [url, setUrl] = useState("ws://localhost:7880"); // LiveKit server

  const roomOptions = {
    audio: true, // publish local mic
    video: false, // no webcam needed
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Local Voice AI</h1>
      
      {!token ? (
        <div>
          <p>Enter your LiveKit token:</p>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ width: "300px", marginRight: "10px" }}
          />
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={url}
          token={token}
          connectOptions={roomOptions}
          audioTrackConstraints={{ echoCancellation: true, noiseSuppression: true }}
          autoSubscribe={true}
          showLocalVideo={false}
        />
      )}
    </div>
  );
}

export default SimpleTTS;
