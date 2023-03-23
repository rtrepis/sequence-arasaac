import { renderHook } from "@testing-library/react";
import { SkinsT } from "../types/sequence";
import useAraSaac from "./useAraSaac";

const mockDispatch = jest.fn();
let mockSelector = { skin: "white" };
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
  useSelector: () => mockSelector,
}));

const mockLanguage = { locale: "en" };
jest.mock("react-intl", () => ({
  ...jest.requireActual("react-intl"),
  useIntl: () => mockLanguage,
}));

beforeEach(() => jest.clearAllMocks());

describe("Given a useAraSacc hook", () => {
  describe("When getSearchPictogram it's called with search wordMock and indexPict", () => {
    test("Then should called dispatch with action creator", async () => {
      const indexPict = 0;
      const wordSearchMock = "girl";
      const expectAction = {
        payload: {
          indexPict: 0,
          word: { keyWord: "girl", pictograms: [234, 234] },
        },
        type: "sequence/upDatePictWord",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, indexPict);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When getSearchPictogram it's called with search invalid wordMock", () => {
    test("Then should called dispatch with action creator", async () => {
      const indexPict = 0;
      const wordSearchMock = "asdfas";
      const expectAction = {
        payload: {
          indexPict: 0,
          word: { keyWord: "asdfas", pictograms: [-1] },
        },
        type: "sequence/upDatePictWord",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, indexPict);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When getSearchPictogram it's called with search wordMock and indexPict and upDateNumber true", () => {
    test("Then should called dispatch with action creator", async () => {
      const indexPict = 0;
      const wordSearchMock = "girl";
      const expectAction = {
        payload: { index: 0, number: 234 },
        type: "sequence/upDatePictNumber",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, indexPict, true);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When toUrlPath it's called with pictogram number and skin asian", () => {
    test("Then return path with query", async () => {
      const expectPath =
        "https://api.arasaac.org/api/pictograms/233?skin=assian";
      const pictogramNumber = 233;
      const skin: SkinsT = "asian";

      const { result } = renderHook(() => useAraSaac());
      const path = await result.current.toUrlPath(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });

  describe("When toUrlPath it's called with skin default ui setting is white", () => {
    test("Then return path with query", async () => {
      const expectPath = "https://api.arasaac.org/api/pictograms/233";
      const pictogramNumber = 233;
      const skin: SkinsT = "default";

      const { result } = renderHook(() => useAraSaac());
      const path = await result.current.toUrlPath(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });

  describe("When toUrlPath it's called with skin default ui setting not white", () => {
    test("Then return path with query", async () => {
      const expectPath =
        "https://api.arasaac.org/api/pictograms/233?skin=black";
      const pictogramNumber = 233;
      mockSelector = { skin: "black" };
      const skin: SkinsT = "default";

      const { result } = renderHook(() => useAraSaac());
      const path = await result.current.toUrlPath(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });
});
