import { renderHook } from "@testing-library/react";
import useAraSaac from "./useAraSaac";

beforeEach(() => jest.clearAllMocks());

describe("Given a useAraSacc hook", () => {
  describe("When getSearchPictogram it's called with search wordMock", () => {
    test("Then should return Pictograms array", async () => {
      const wordSearchMock = "girl";
      const expectPict = [234, 234];

      const { result } = renderHook(() => useAraSaac());

      const findPictogram = await result.current.getSearchPictogram(
        wordSearchMock
      );

      expect(findPictogram).toStrictEqual(expectPict);
    });
  });

  describe("When getSearchPictogram it's called with search invalid wordMock", () => {
    test("Then should return Pictograms array", async () => {
      const wordSearchMock = "asdfas";
      const expectPict = "Error 404, not found";

      const { result } = renderHook(() => useAraSaac());

      const findPictogram = await result.current.getSearchPictogram(
        wordSearchMock
      );

      expect(findPictogram).toStrictEqual(expectPict);
    });
  });
});
