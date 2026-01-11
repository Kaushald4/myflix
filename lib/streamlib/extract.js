"use server";
import axios from "axios";
import * as cheerio from "cheerio";
import { addStreamHost, getStreamLink } from "./decoder";
import { proxyLink } from "./proxyLink";

export const extractStreamLink = async (id, type, season, episode) => {
  let URL = "";

  if (type === "movie") {
    URL = `https://vidsrc-embed.ru/embed/movie/${id}`;
  } else {
    URL = `https://vidsrc-embed.ru/embed/tv/${id}/${season}-${episode}`;
  }

  try {
    const response = await axios.get(URL, {
      headers: {
        Host: "vidsrc-embed.ru",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const fistLink = $("#player_iframe").attr("src");
    const firstFullLink = "https:" + fistLink;

    const secondResponse = await axios.get(firstFullLink, {
      headers: {
        host: "cloudnestra.com",
        Referer: URL,
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    const html = secondResponse.data;

    const match = html.match(/src\s*:\s*['"](\/prorcp\/[A-Za-z0-9+\/=-]+)['"]/);
    const iframeSrc = match ? match[1] : null;
    const fullIFrameLink = `https://cloudnestra.com${iframeSrc}`;

    const thirdResponse = await axios.get(fullIFrameLink, {
      headers: {
        host: "cloudnestra.com",
        Referer: fullIFrameLink,
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    const $2 = cheerio.load(thirdResponse.data);
    const encodedStr = $2('div[style="display:none;"]').text();
    const encodedId = $2('div[style="display:none;"]').attr("id");

    if (!encodedStr || !encodedId) {
      const regex =
        /https:\/\/(?:tmstr1|tmstr2)\.\{v\d+\}\/(?:pl|cdnstr)\/[A-Za-z0-9._\-]+\/(?:master\.m3u8|list\.m3u8)/g;
      const urls = thirdResponse.data?.match(regex);
      if (!urls || urls?.length === 0) return null;
      const urlsWithHost = addStreamHost(urls?.join(","));
      return proxyLink(urlsWithHost?.split(",")?.[0]);
    } else {
      const links = getStreamLink(encodedId, encodedStr)?.split("or");
      return proxyLink(links?.[0]?.trim());
    }
  } catch (error) {
    console.log(error);
  }
};
