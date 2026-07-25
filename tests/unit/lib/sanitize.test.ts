import { sanitizeString, sanitizeObject } from "../../../src/lib/sanitize";

describe("sanitizeString", () => {
  it("should return the string unchanged when clean", () => {
    expect(sanitizeString("Hello World")).toBe("Hello World");
  });

  it("should strip HTML tags", () => {
    // Script tags stripped, text content preserved
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      'alert("xss")',
    );
  });

  it("should strip self-closing HTML tags", () => {
    expect(sanitizeString('<img src="x" onerror="alert(1)"/>')).toBe("");
    expect(sanitizeString("<img src=x onerror=alert(1)>")).toBe("");
  });

  it("should strip control characters but keep tabs, newlines, and carriage returns", () => {
    const input = "Hello\x00World\x0BTest\x7FEnd";
    const result = sanitizeString(input);
    expect(result).toBe("HelloWorldTestEnd");
    // Does not contain control characters
    expect(result).not.toContain("\x00");
    expect(result).not.toContain("\x0B");
    expect(result).not.toContain("\x7F");
  });

  it("should preserve tabs, newlines, and carriage returns", () => {
    const input = "Line1\tLine2\nLine3\rLine4";
    const result = sanitizeString(input);
    expect(result).toContain("Line1");
    expect(result).toContain("Line2");
    expect(result).toContain("Line3");
    expect(result).toContain("Line4");
  });

  it("should normalize multiple spaces into one", () => {
    expect(sanitizeString("Hello    World")).toBe("Hello World");
    expect(sanitizeString("Hello   \n  World")).toBe("Hello World");
  });

  it("should trim leading and trailing whitespace", () => {
    expect(sanitizeString("  Hello World  ")).toBe("Hello World");
    expect(sanitizeString("\n\t Hello \t\n")).toBe("Hello");
  });

  it("should truncate to maxLength when provided", () => {
    expect(sanitizeString("Hello World", 5)).toBe("Hello");
  });

  it("should strip lone surrogate halves", () => {
    // Lone high surrogate (U+D800) without low surrogate
    const input = "Bad\uD800String";
    const result = sanitizeString(input);
    expect(result).toBe("BadString");
  });

  it("should return empty string for empty input", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("should return empty string for whitespace-only input", () => {
    expect(sanitizeString("   \n\t  ")).toBe("");
  });
});

describe("sanitizeObject", () => {
  it("should sanitize all string values", () => {
    const input = {
      external_id: '<script>TEST-001</script>',
      brand: "  Toyota  ",
      year: 2026,
      status: "READY_STOCK",
    };

    const result = sanitizeObject(input);

    // HTML tags stripped, alphanumeric text preserved
    expect(result.external_id).toBe("TEST-001");
    expect(result.brand).toBe("Toyota");
    expect(result.year).toBe(2026); // Non-string passes through
    expect(result.status).toBe("READY_STOCK");
  });

  it("should apply field-specific max lengths", () => {
    const input = {
      color: "A".repeat(100), // max 50
      brand: "B".repeat(200), // max 100
    };

    const result = sanitizeObject(input);

    expect((result.color as string).length).toBe(50);
    expect((result.brand as string).length).toBe(100);
  });

  it("should pass through non-string values unchanged", () => {
    const input = {
      year: 2026,
      active: true,
      count: null,
    };

    const result = sanitizeObject(input);
    expect(result.year).toBe(2026);
    expect(result.active).toBe(true);
    expect(result.count).toBeNull();
  });
});
