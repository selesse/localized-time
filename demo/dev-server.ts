const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Default to index.html
    if (path === "/" || path === "") {
      path = "/index.html";
    }

    // Serve index.html
    if (path === "/index.html") {
      return new Response(Bun.file("./demo/index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Build and serve demo.ts with all dependencies bundled
    if (path === "/demo.ts" || path === "/demo.js") {
      const result = await Bun.build({
        entrypoints: ["./demo/demo.ts"],
        format: "esm",
        target: "browser",
        // Bundle everything together
        bundle: true,
      });

      if (result.success && result.outputs[0]) {
        return new Response(await result.outputs[0].text(), {
          headers: { "Content-Type": "application/javascript" },
        });
      }

      // Return build errors
      console.error("Build failed:", result.logs);
      return new Response(`Build failed: ${result.logs.join("\n")}`, {
        status: 500,
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Dev server running at http://localhost:${server.port}`);
console.log("Open your browser to see the demo.");
