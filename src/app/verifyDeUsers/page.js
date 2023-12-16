"use client";
import { useState, useEffect, useRef } from "react";
import styles from "../page.module.css";
import { socket } from "../../clients/socket";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const [isMounted, setIsMounted] = useState(false);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [savedUserDetails, setSavedUserDetails] = useState();
  const [screenshot, setScreenshot] = useState();
  const [randomNumber, setRandomNumber] = useState();
  const connectedTimer = useRef(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);

      socket.emit("join", name);
      socket.emit("registerMod", name);
      connectedTimer.current = setInterval(
        () => socket.emit("registerMod", name),
        500
      );
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function userDetails(value) {
      console.log("got details", value);
      clearInterval(connectedTimer.current);

      socket.emit("requestScreenshot", name);

      setSavedUserDetails(JSON.parse(value));
    }

    function userScreenshot(value) {
      console.log("got screenshot", value);
      setScreenshot(value);
    }

    function onRandomNumber(value) {
      console.log("random number", value);
      setScreenshot(null);
      setRandomNumber(value);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("both_randomNumber", onRandomNumber);
    socket.on("mod_UserDetails", userDetails);
    socket.on("mod_UserScreenshot", userScreenshot);

    setIsMounted(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("both_randomNumber", onRandomNumber);
      socket.off("mod_UserDetails", userDetails);
      socket.off("mod_UserScreenshot", userScreenshot);

      clearInterval(connectedTimer.current);
    };
  }, []);

  const done = () => {
    socket.emit("verificationDone", name);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <h1>Let's verify, {name}</h1>
      {!savedUserDetails ? <h2>Waiiting for {name} to join...</h2> : null}
      {savedUserDetails ? (
        <div>
          <div>
            <h2>Operating system</h2>
            {savedUserDetails.os.name} - {savedUserDetails.os.version}
          </div>
          <div>
            <h2>User agent</h2>
            {savedUserDetails.ua}
          </div>
          <div>
            <h2>Browser</h2>
            {savedUserDetails.browser.name} - {savedUserDetails.browser.version}
          </div>
          <div>
            <h2>User screenshot</h2>
            <b>
              The users screenshot should include this random number:{" "}
              {randomNumber}
            </b>
            {!screenshot ? (
              <h2>Waiting for user to upload screenshot...</h2>
            ) : null}
            {screenshot ? (
              <div>
                <img width="800" src={screenshot} />
              </div>
            ) : null}
            <div>
              Once you press verificaiton done, the user will be kicked out of
              the page.
              <div>
                <button onClick={() => done()}> Verification done </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
