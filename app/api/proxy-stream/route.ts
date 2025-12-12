import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import https from "https";

// Use a persistent agent to avoid opening too many TCP connections (helps with 429)
const httpsAgent = new https.Agent({ keepAlive: true });

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

    // Stream the response instead of buffering
    const response = await axios.get(contentUrl, {
      responseType: "stream",
      httpsAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );
    headers.set("Access-Control-Allow-Origin", "*");
    if (response.headers["content-length"]) {
      headers.set("Content-Length", response.headers["content-length"]);
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch stream link" },
      { status: 500 }
    );
  }
}
