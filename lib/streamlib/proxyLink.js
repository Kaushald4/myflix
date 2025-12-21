import axios from "axios";

function rewriteM3U8Urls(m3u8Text, baseUrl) {
  const base = new URL(baseUrl);

  return m3u8Text
    .split("\n")
    .map((line) => {
      if (line.startsWith("#") || line.trim() === "") {
        return line;
      }

      const absoluteUrl = new URL(line.trim(), base).toString();
      const encoded = encodeURIComponent(absoluteUrl);

      return `${process.env.NEXT_PUBLIC_WEB_URL}/api/stream?url=${encoded}&.m3u8`;
    })
    .join("\n");
}

export const proxyLink = async (link) => {
  try {
    const response = await axios.get(link, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      },
    });

    return rewriteM3U8Urls(response.data, link);
  } catch (error) {
    console.error("Error in proxyLink:", error);
    return null;
  }
};
