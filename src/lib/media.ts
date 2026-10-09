/** Gera embeds somente para hosts e identificadores conhecidos. */
export function mediaEmbed(
  value: string,
): { src: string; instagram: boolean } | null {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return null;
    if (["instagram.com", "www.instagram.com"].includes(u.hostname)) {
      const m = u.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/);
      return m
        ? {
            src: `https://www.instagram.com/${m[1]}/${m[2]}/embed/`,
            instagram: true,
          }
        : null;
    }
    if (
      ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
        u.hostname,
      )
    ) {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1).replace(/\/$/, "")
          : u.pathname === "/watch"
            ? u.searchParams.get("v")
            : u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
      return id && /^[\w-]{11}$/.test(id)
        ? {
            src: "https://www.youtube-nocookie.com/embed/" + id,
            instagram: false,
          }
        : null;
    }
    if (
      ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
      /^\/\d+$/.test(u.pathname)
    )
      return {
        src: "https://player.vimeo.com/video" + u.pathname,
        instagram: false,
      };
    return null;
  } catch {
    return null;
  }
}
