import { describe, expect, it } from "vitest";
import { whatsappLink } from "@/lib/site";

describe("whatsappLink", () => {
  it("builds a wa.me link with the message URL-encoded", () => {
    expect(whatsappLink("573218284129", "Hola, quiero cotizar: ultrasonido & tubería")).toBe(
      "https://wa.me/573218284129?text=Hola%2C%20quiero%20cotizar%3A%20ultrasonido%20%26%20tuber%C3%ADa",
    );
  });
});
