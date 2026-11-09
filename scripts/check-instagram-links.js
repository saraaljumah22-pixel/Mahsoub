#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const officialProfile = "https://www.instagram.com/ma7sob.kw/";
const htmlPath = process.argv[2] || path.join(process.cwd(), "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const instagramPattern = /instagram-link|instagram-icon|@ma7sob\.kw|instagram|إنستغرام/i;

function getAttribute(tag, name) {
  return tag.match(new RegExp(`(?:\\s|^)${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2] || "";
}

function extractElement(source, tagName, matchesOpeningTag) {
  const openingTags = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let openingTag;

  while ((openingTag = openingTags.exec(source))) {
    if (!matchesOpeningTag(openingTag[0])) continue;

    const elementTags = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
    elementTags.lastIndex = openingTag.index;
    let depth = 0;
    let elementTag;

    while ((elementTag = elementTags.exec(source))) {
      if (new RegExp(`^<${tagName}\\b`, "i").test(elementTag[0])) {
        depth += 1;
      } else {
        depth -= 1;
        if (depth === 0) {
          return source.slice(openingTag.index, elementTags.lastIndex);
        }
      }
    }
    return "";
  }

  return "";
}

function findInstagramAnchors(source) {
  return (source.match(/<a\b[^>]*>[\s\S]*?<\/a\s*>/gi) || []).filter((anchor) => {
    const openingTag = anchor.match(/^<a\b[^>]*>/i)?.[0] || "";
    const href = getAttribute(openingTag, "href");
    return /instagram/i.test(href) || instagramPattern.test(anchor);
  });
}

const instagramAnchors = findInstagramAnchors(html);
const requiredAreas = [
  {
    name: "homepage section",
    content: extractElement(
      html,
      "section",
      (tag) => getAttribute(tag, "id") === "home",
    ),
  },
  {
    name: "contact section",
    content: extractElement(
      html,
      "section",
      (tag) => getAttribute(tag, "id") === "contact",
    ),
  },
  {
    name: "footer",
    content: extractElement(
      html,
      "footer",
      (tag) => /\bsite-footer\b/i.test(getAttribute(tag, "class")),
    ),
  },
];

const missingAreas = requiredAreas
  .filter((area) => !area.content || findInstagramAnchors(area.content).length === 0)
  .map((area) => area.name);

if (missingAreas.length > 0) {
  console.error(`Instagram links are missing from: ${missingAreas.join(", ")}`);
  process.exit(1);
}

if (instagramAnchors.length === 0) {
  console.error(`No Instagram links found in ${htmlPath}`);
  process.exit(1);
}

const invalidLinks = instagramAnchors
  .map((anchor) => {
    const openingTag = anchor.match(/^<a\b[^>]*>/i)?.[0] || "";
    const href = getAttribute(openingTag, "href");
    return href === officialProfile ? null : href || "(missing href)";
  })
  .filter(Boolean);

if (invalidLinks.length > 0) {
  console.error(
    `Instagram links must all point to ${officialProfile}. Found: ${invalidLinks.join(", ")}`,
  );
  process.exit(1);
}

console.log(
  `Checked ${instagramAnchors.length} Instagram links across the homepage section, contact section, and footer: all use ${officialProfile}`,
);
