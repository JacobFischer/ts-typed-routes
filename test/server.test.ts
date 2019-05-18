import { Server } from "http";
import { PORT, start } from "../src/server";

describe("Server", () => {
  it("has a port to bind to", () => {
    expect(PORT).toBeGreaterThan(0);
  });

  let server: Server | undefined;
  it("starts", async () => {
    server = await start(false);
    expect(server).toBeInstanceOf(Server);
    expect(server.listening).toBe(true);
  });

  it("closes", async () => {
    expect(server).toBeInstanceOf(Server);
    if (!server) {
      throw new Error("Paradox: Server exists but does not?");
    }

    expect(server.listening).toBe(true);
    server.close();
    expect(server.listening).toBe(false);
  });
});
