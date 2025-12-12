/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentUrl = searchParams.get("url");

    if (!contentUrl) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    const response = await axios.get(contentUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const baseUrl = new URL(contentUrl);

    const data = response.data
      ?.split("\n")
      .map((line: string) => {
        if (line.startsWith("#") || line.trim() === "") {
          return line; // keep metadata lines intact
        }

        // Resolve relative URL against the current playlist URL
        const absoluteUrl = new URL(line.trim(), baseUrl).toString();
        const encoded = encodeURIComponent(absoluteUrl);

        // If it's an m3u8 (nested playlist), route through /api/stream
        // Otherwise (segments), route through /api/proxy-stream
        if (absoluteUrl.includes(".m3u8")) {
          return `${process.env.NEXT_PUBLIC_WEB_URL}/api/stream?url=${encoded}&.m3u8`;
        }

        return `${process.env.NEXT_PUBLIC_WEB_URL}/api/proxy-stream?url=${encoded}&.ts`;
      })
      .join("\n");

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch stream link" },
      { status: 500 }
    );
  }
}
