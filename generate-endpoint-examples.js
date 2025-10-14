#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { input: "src/postman_endpoint.json", output: "ENDPOINTS_EXAMPLES.md", format: "md" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-i" || a === "--input") args.input = argv[++i];
    else if (a === "-o" || a === "--output") args.output = argv[++i];
    else if (a === "-f" || a === "--format") args.format = argv[++i];
    else if (a === "-h" || a === "--help") args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node generate-endpoint-examples.js [options]\n\nOptions:\n  -i, --input   Path to Postman collection JSON (default: src/postman_endpoint.json)\n  -o, --output  Path to output file (default: ENDPOINTS_EXAMPLES.md)\n  -f, --format  Output format: md|json (default: md)\n  -h, --help    Show this help\n`);
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function isLeafItem(item) {
  return !!item.request; // folders have `item: [...]`, leafs have `request`
}

function flattenPostmanItems(items, groupPath = []) {
  const results = [];
  for (const it of items || []) {
    if (isLeafItem(it)) {
      results.push({
        group: groupPath.join(" / "),
        name: it.name || "",
        method: it.request?.method || "GET",
        headers: (it.request?.header || []).reduce((acc, h) => { acc[h.key] = h.value; return acc; }, {}),
        bodyRaw: it.request?.body?.raw || null,
        urlRaw: it.request?.url?.raw || "",
      });
    } else if (Array.isArray(it.item)) {
      const newGroupPath = [...groupPath, it.name || ""];
      results.push(...flattenPostmanItems(it.item, newGroupPath));
    }
  }
  return results;
}

function looksLikeGetById(urlRaw) {
  // simple heuristic: ends with /number (as provided in the collection)
  return /\/(\d+)(\?.*)?$/.test(urlRaw);
}

function looksLikeList(urlRaw) {
  // if query string present or ends at a collection path
  return /\?|\/(api|v\d+)\//.test(urlRaw) && !looksLikeGetById(urlRaw);
}

function contains(str, needle) { return str.toLowerCase().includes(needle.toLowerCase()); }

function buildSuccessExample(ep) {
  const { method, urlRaw, bodyRaw } = ep;
  const body = safeParseJson(bodyRaw);

  // Auth special case
  if (contains(urlRaw, "/auth/login") && method === "POST") {
    return { status: 200, body: { token: "JWT_TOKEN", user: { id: 1, username: "admin", role: "admin" } } };
  }

  // Reports special cases
  if (contains(urlRaw, "/reports/members-summary") && method === "GET") {
    return { status: 200, body: { totals: [{ sex: "M", cnt: 100 }, { sex: "F", cnt: 80 }], per_year: [{ year: 2023, cnt: 120 }, { year: 2024, cnt: 160 }] } };
  }
  if (contains(urlRaw, "/reports/unions-cba-expired") && method === "GET") {
    return { status: 200, body: { data: [{ union_id: 1, name_en: "Union A", next_end_date: "2025-07-01" }] } };
  }
  if (contains(urlRaw, "/reports/cache") && method === "POST") {
    return { status: 201, body: Object.assign({ id: 1 }, body || { report_name: "example", payload: { key: "value" } }) };
  }

  // Members archive (DELETE ...?archive=true)
  if (method === "DELETE" && contains(urlRaw, "/members/") && contains(urlRaw, "archive=true")) {
    return { status: 200, body: { message: "Member archived" } };
  }

  // Heuristics by method
  if (method === "GET") {
    if (looksLikeGetById(urlRaw)) {
      return { status: 200, body: { id: 1, /* resource fields */ } };
    }
    // list
    return { status: 200, body: { data: [], meta: { total: 0, page: 1, per_page: 20 } } };
  }
  if (method === "POST") {
    // generic create: echo body with id and timestamps placeholders
    const created = Object.assign({}, body || {}, { id: 1 });
    return { status: 201, body: created };
  }
  if (method === "PUT" || method === "PATCH") {
    const updated = Object.assign({ id: 1 }, body || {});
    return { status: 200, body: updated };
  }
  if (method === "DELETE") {
    // confirm-driven deletes default
    return { status: 200, body: { message: "Deleted" } };
  }
  return { status: 200, body: {} };
}

function buildErrorExamples(ep) {
  const { method, urlRaw, bodyRaw } = ep;
  const errors = [];

  // Unauthorized for protected routes (bearer expected)
  if (!contains(urlRaw, "/auth/login") && contains(urlRaw, "/api/")) {
    errors.push({ status: 401, body: { message: "Unauthorized" } });
  }

  // Auth login specific
  if (contains(urlRaw, "/auth/login") && method === "POST") {
    errors.push({ status: 400, body: { message: "username and password required" } });
    errors.push({ status: 401, body: { message: "Invalid credentials" } });
    return errors;
  }

  // Not found for get/update/delete by id
  if ((method === "GET" || method === "PUT" || method === "PATCH" || method === "DELETE") && looksLikeGetById(urlRaw)) {
    errors.push({ status: 404, body: { message: "Not found" } });
  }

  // Confirm errors for delete endpoints
  if (method === "DELETE" && !contains(urlRaw, "confirm=true") && !contains(urlRaw, "archive=true")) {
    errors.push({ status: 400, body: { message: "To delete set ?confirm=true" } });
  }

  // Validation for create/update when body exists
  const body = safeParseJson(bodyRaw);
  if ((method === "POST" || method === "PUT" || method === "PATCH") && body && Object.keys(body).length > 0) {
    errors.push({ status: 400, body: { message: "Validation error" } });
  }

  // Server error generic
  errors.push({ status: 500, body: { message: "Server error" } });
  return errors;
}

function safeParseJson(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function toMarkdown(endpoints) {
  let out = "## API Endpoint Examples\n\nGenerated from Postman collection. Success/error bodies are heuristic.\n\n";
  for (const ep of endpoints) {
    const success = buildSuccessExample(ep);
    const errors = buildErrorExamples(ep);

    out += `### [${ep.method}] ${ep.urlRaw} ${ep.name ? "- " + ep.name : ""}\n`;
    if (ep.group) out += `Group: ${ep.group}\n\n`;

    if (Object.keys(ep.headers || {}).length > 0) {
      out += "Headers:\n";
      out += "```json\n" + JSON.stringify(ep.headers, null, 2) + "\n```\n\n";
    }

    if (ep.bodyRaw) {
      const body = safeParseJson(ep.bodyRaw) || ep.bodyRaw;
      out += "Request Body:\n";
      out += "```json\n" + JSON.stringify(body, null, 2) + "\n```\n\n";
    }

    out += `Success (${success.status}):\n`;
    out += "```json\n" + JSON.stringify(success.body, null, 2) + "\n```\n\n";

    if (errors.length) {
      out += "Errors:\n";
      for (const er of errors) {
        out += `- ${er.status}:\n`;
        out += "```json\n" + JSON.stringify(er.body, null, 2) + "\n```\n";
      }
      out += "\n";
    }
  }
  return out;
}

function toJson(endpoints) {
  const arr = endpoints.map((ep) => ({
    name: ep.name,
    group: ep.group,
    method: ep.method,
    url: ep.urlRaw,
    headers: ep.headers,
    requestBody: safeParseJson(ep.bodyRaw),
    success: buildSuccessExample(ep),
    errors: buildErrorExamples(ep),
  }));
  return JSON.stringify(arr, null, 2);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) return printHelp();

  const inputPath = path.resolve(process.cwd(), args.input);
  const outputPath = path.resolve(process.cwd(), args.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  const collection = readJson(inputPath);
  const endpoints = flattenPostmanItems(collection.item || []);

  const content = args.format === "json" ? toJson(endpoints) : toMarkdown(endpoints);
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`Generated ${args.format.toUpperCase()} examples -> ${outputPath}`);
}

if (require.main === module) {
  main();
}
