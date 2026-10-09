import { test } from "node:test";
import assert from "node:assert/strict";
import { mediaEmbed } from "../src/lib/media";
import { resourceSchema } from "../src/lib/catalog";
test("YouTube, Shorts e Instagram geram apenas URLs canônicas", () => {
  assert.equal(
    mediaEmbed("https://youtu.be/abcdefghijk?si=abc")?.src,
    "https://www.youtube-nocookie.com/embed/abcdefghijk",
  );
  assert.equal(
    mediaEmbed("https://www.youtube.com/shorts/abcdefghijk")?.src,
    "https://www.youtube-nocookie.com/embed/abcdefghijk",
  );
  assert.equal(
    mediaEmbed("https://www.instagram.com/reel/ABC_123/?igsh=test")?.src,
    "https://www.instagram.com/reel/ABC_123/embed/",
  );
  for (const u of [
    "https://instagram.com.evil.test/p/abc/",
    "javascript:alert(1)",
    "https://u:p@instagram.com/p/abc/",
    "https://instagram.com/profile/",
    "https://youtube.com/watch?v=bad",
  ])
    assert.equal(mediaEmbed(u), null);
});
test("Galeria exige imagem e descrição; página institucional aceita seções", () => {
  assert.equal(
    resourceSchema.safeParse({
      kind: "photo",
      title: "Foto teste",
      data: { url: "https://example.org/foto.jpg" },
    }).success,
    false,
  );
  assert.equal(
    resourceSchema.safeParse({
      kind: "photo",
      title: "Foto teste",
      data: { url: "https://example.org/foto.jpg", alt: "Participantes" },
    }).success,
    true,
  );
  assert.equal(
    resourceSchema.safeParse({
      kind: "about",
      title: "Missão",
      body: "Cooperação regional",
    }).success,
    true,
  );
});
