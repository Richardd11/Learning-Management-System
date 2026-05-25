import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, getInitials, getDifficultyColor, truncate, cn } from "./utils";

describe("formatPrice", () => {
  it("returns 'Free' for price 0", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("formats a positive price as USD currency", () => {
    expect(formatPrice(49.99)).toBe("$49.99");
  });

  it("formats whole dollar amounts", () => {
    expect(formatPrice(100)).toBe("$100.00");
  });

  it("formats large prices with commas", () => {
    expect(formatPrice(1299.99)).toBe("$1,299.99");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    const result = formatDate("2024-06-15T10:00:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("getInitials", () => {
  it("returns uppercase initials from first and last name", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
  });

  it("handles single character names", () => {
    expect(getInitials("A", "B")).toBe("AB");
  });
});

describe("getDifficultyColor", () => {
  it("returns green for beginner", () => {
    expect(getDifficultyColor("beginner")).toContain("green");
  });

  it("returns yellow for intermediate", () => {
    expect(getDifficultyColor("intermediate")).toContain("yellow");
  });

  it("returns red for advanced", () => {
    expect(getDifficultyColor("advanced")).toContain("red");
  });

  it("returns gray for unknown difficulty", () => {
    expect(getDifficultyColor("unknown")).toContain("gray");
  });
});

describe("truncate", () => {
  it("returns the string unchanged if under limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("returns exact-length strings unchanged", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges Tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
});
