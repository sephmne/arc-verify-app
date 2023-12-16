"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { socket } from "../clients/socket";
import { useSearchParams } from "next/navigation";
import UAParser from "ua-parser-js";

export default function Home() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const [isMounted, setIsMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [screenshotRequested, setScreenshotRequested] = useState(false);
  const [randomNumber, setRandomNumber] = useState();
  const connectedTimer = useRef(null);

  let parser = new UAParser();
  let parserResults = parser.getResult();

  useEffect(() => {
    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("both_randomNumber", onRandomNumber);
      socket.off("user_requestDetails", onRequestDetails);
      socket.off("user_screenshotRequested", onScreenshotRequest);
      socket.off("user_verificationDone", onVerificationDone);

      clearInterval(connectedTimer.current);
    };

    function onConnect() {
      setIsConnected(true);

      socket.emit("join", name);
      connectedTimer.current = setInterval(() => {
        console.log("registering");
        socket.emit("register", name);
      }, 1000);
      socket.emit("register", name);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRequestDetails() {
      socket.emit("userAgentDetails", {
        username: name,
        details: JSON.stringify(parserResults),
      });
    }

    function onScreenshotRequest() {
      console.log("screenshot requested");
      setScreenshotRequested(true);

      // reset timer and use 60 second interval instead
      clearInterval(connectedTimer.current);
    }

    function onRandomNumber(value) {
      console.log("random number", value);

      setRandomNumber(value);
    }

    function onVerificationDone() {
      cleanup();
      window.location.href = "https://www.isarconwindowsyet.com/";
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("both_randomNumber", onRandomNumber);
    socket.on("user_requestDetails", onRequestDetails);
    socket.on("user_screenshotRequested", onScreenshotRequest);
    socket.on("user_verificationDone", onVerificationDone);

    setIsMounted(true);

    return () => {
      cleanup();
    };
  }, []);

  const capture = async () => {
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia();
      const video = document.createElement("video");
      video.srcObject = captureStream;
      video.onloadedmetadata = () => {
        // Make sure video is ready
        video.play();

        // Create a canvas and draw the video frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL("image/jpeg");

        // Process the frame data here
        socket.emit("userScreenshot", { username: name, screenshot: frame });

        // Stop the capture stream
        captureStream.getTracks().forEach((track) => track.stop());
      };

      // send to mod
    } catch (err) {
      alert("Something went wrong. 😭");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <h1>{randomNumber}</h1>
      <h1>Hello, {name}</h1>
      <h2>Let's get you verified as a Arc Windows user 🤩</h2>

      {!screenshotRequested ? (
        <>
          <h3>If you haven't already, please open this in your Arc browser.</h3>
          <h3>Please wait...</h3>
        </>
      ) : (
        <div>
          <p>
            Please share your screen, ensuring you select "Window" and pick the
            Arc browser with this page open on it.
          </p>
          <button onClick={() => capture()}> Take screenshot </button>
        </div>
      )}
    </div>
  );
}
