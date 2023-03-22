import { renderHook } from "@testing-library/react";
import useDebounce from "./useDebounce";

describe("useDebounce", () => {
  test("should return the initial value when no delay is set", () => {
    // GIVEN
    const value = "hello";
    const delay = 0;

    // WHEN
    const { result } = renderHook(() => useDebounce(value, delay));

    // THEN
    expect(result.current).toEqual(value);
  });

  test("should return the updated value after the delay", async () => {
    // GIVEN
    const value = "hello";
    const updatedValue = "hello world";
    const delay = 500;
    jest.useFakeTimers();

    // WHEN
    const { result, rerender } = renderHook(() =>
      useDebounce(updatedValue, delay)
    );
    rerender({ value: value, delay });
    jest.advanceTimersByTime(delay);

    // THEN
    expect(result.current).toEqual(updatedValue);
  });
});
