"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href =
      "https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fpaystream.maushish.com%2Fapi%2Fpaystream_api&cluster=devnet";
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1>Redirecting...</h1>
    </main>
  );
}