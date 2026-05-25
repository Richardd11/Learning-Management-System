import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, courseSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "pass123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "pass123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email");
    }
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password is required");
    }
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwIssue = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(pwIssue?.message).toBe("Passwords don't match");
    }
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 8 characters");
    }
  });

  it("rejects an empty first name", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "bad" });
    expect(result.success).toBe(false);
  });
});

describe("courseSchema", () => {
  const validCourse = {
    title: "React Masterclass",
    description: "Learn React from scratch with hands-on projects",
    price: 49.99,
    difficulty: "intermediate" as const,
  };

  it("accepts valid course data", () => {
    const result = courseSchema.safeParse(validCourse);
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = courseSchema.safeParse({ ...validCourse, title: "AB" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title must be at least 3 characters");
    }
  });

  it("rejects a description shorter than 10 characters", () => {
    const result = courseSchema.safeParse({ ...validCourse, description: "Short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Description must be at least 10 characters");
    }
  });

  it("rejects a negative price", () => {
    const result = courseSchema.safeParse({ ...validCourse, price: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid difficulty", () => {
    const result = courseSchema.safeParse({ ...validCourse, difficulty: "expert" });
    expect(result.success).toBe(false);
  });

  it("accepts optional shortDesc and tags", () => {
    const result = courseSchema.safeParse({
      ...validCourse,
      shortDesc: "Quick intro",
      tags: "react,typescript",
    });
    expect(result.success).toBe(true);
  });

  it("coerces string prices to numbers", () => {
    const result = courseSchema.safeParse({ ...validCourse, price: "29.99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(29.99);
    }
  });
});
