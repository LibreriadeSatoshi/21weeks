import { describe, expect, it } from "vitest";
import { repairJsonObject } from "./structured-output";

describe("repairJsonObject", () => {
  it("extracts JSON from a Markdown fence", () => {
    expect(repairJsonObject("```json\n{\"rankings\":[]}\n```")).toBe(
      "{\"rankings\":[]}",
    );
  });

  it("removes prose around the JSON object", () => {
    expect(repairJsonObject("Resultado:\n{\"rankings\":[]}\nFin")).toBe(
      "{\"rankings\":[]}",
    );
  });

  it("preserves braces inside JSON strings", () => {
    const json = "{\"rankings\":[{\"reason\":\"Usa {llaves}\"}]}";
    expect(repairJsonObject(`${json}\nTexto posterior`)).toBe(json);
  });

  it("rejects empty or non-JSON output", () => {
    expect(repairJsonObject("")).toBeNull();
    expect(repairJsonObject("Sin objeto")).toBeNull();
  });
});
