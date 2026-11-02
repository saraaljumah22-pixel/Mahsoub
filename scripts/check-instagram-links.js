#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const officialProfile = "https://www.instagram.com/ma7sob.kw/";
const htmlPath = process.argv[2] || path.join(process.cwd(), "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a\s*>/gi) || [];
const instagramAnchors = anchors.filter((anchor) => {
  const openingTag = anchor.match(/^<a\b[^>]*>/i)?.[0] || "";
  const href = openingTag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
  return (
    /instagram/i.test(href) ||
    /instagram-link|instagram-icon|@ma7sob\.kw|instagram|إنستغرام/i.test(anchor)
  );
});

if (instagramAnchors.length === 0) {
  console.error(`No Instagram links found in ${htmlPath}`);
  process.exit(1);
}

const invalidLinks = instagramAnchors
  .map((anchor) => {
    const openingTag = anchor.match(/^<a\b[^>]*>/i)?.[0] || "";
    const href = openingTag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
    return href === officialProfile ? null : href || "(missing href)";
  })
  .filter(Boolean);

if (invalidLinks.length > 0) {
  console.error(
    `Instagram links must all point to ${officialProfile}. Found: ${invalidLinks.join(", ")}`,
  );
  process.exit(1);
}

console.log(`Checked ${instagramAnchors.length} Instagram links: all use ${officialProfile}`);
