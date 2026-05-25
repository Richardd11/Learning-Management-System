import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update the value before the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe("initial");

    vi.useRealTimers();
  });

  it("updates the value after the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("updated");

    vi.useRealTimers();
  });

  it("resets the timer on rapid changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "abc" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "abcd" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("abcd");

    vi.useRealTimers();
  });
});
