import { renderHook } from "../utils/test-utils";
import { Skins } from "../types/sequence";
import useAraSaac from "./useAraSaac";

const mockDispatch = jest.fn();
let mockSelector: any = { skin: "white" };
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
          indexSequence: 0,
          searched: { bestIdPicts: [234, 234], word: "girl" },
        },
        type: "sequence/searched",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, indexPict, true);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When getSearchPictogram it's called with search invalid wordMock", () => {
    test("Then should called dispatch with action creator", async () => {
      const indexPict = 0;
      const wordSearchMock = "asdfas";
      const expectAction = {
        payload: {
          indexSequence: 0,
          searched: { bestIdPicts: [-1], word: "asdfas" },
        },
        type: "sequence/searched",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, indexPict, true);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When getSearchPictogram it's called with search wordMock and not update", () => {
    test("Then should called dispatch with action creator", async () => {
      mockSelector = 1;

      const wordSearchMock = "girl";
      const expectAction = {
        payload: {
          img: {
            searched: { bestIdPicts: [3418], word: "girl" },
            selectedId: 3418,
            settings: { fitzgerald: "#666" },
          },
          indexSequence: 2,
          settings: 1,
          text: "girl",
        },
        type: "sequence/addPictogram",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, 1, false);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When getSearchPictogram it's called with search invalid wordMock not update", () => {
    test("Then should called dispatch with action creator", async () => {
      mockSelector = 1;

      const wordSearchMock = "asdfas";
      const expectAction = {
        payload: {
          img: {
            searched: { bestIdPicts: [3418], word: "asdfas" },
            selectedId: 3418,
            settings: { fitzgerald: "#666" },
          },
          indexSequence: 2,
          settings: 1,
          text: "asdfas",
        },
        type: "sequence/addPictogram",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSearchPictogram(wordSearchMock, 1, false);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });

  describe("When toUrlPath it's called with pictogram number and skin asian", () => {
    test("Then return path with query", async () => {
      mockSelector = { skin: "white" };
      const expectPath =
        "https://api.arasaac.org/api/pictograms/233?skin=assian";
      const pictogramNumber = 233;
      const skin: Skins = "asian";

      const { result } = renderHook(() => useAraSaac());
      const path = await result.current.toUrlPath(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });

  describe("When toUrlPath it's called with skin default ui setting is white", () => {
    test("Then return path with query", async () => {
      mockSelector = { skin: "white" };
      const expectPath = "https://api.arasaac.org/api/pictograms/233";
      const pictogramNumber = 233;
      const skin: Skins = "white";

      const { result } = renderHook(() => useAraSaac());
      const path = await result.current.toUrlPath(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });

  describe("When toUrlPath it's called with skin default ui setting not white", () => {
    test("Then return path with query", async () => {
      const expectPath =
        "https://api.arasaac.org/api/pictograms/233?skin=assian";
      const pictogramNumber = 233;
      const skin: Skins = "asian";

      const { result } = renderHook(() => useAraSaac());
      const path = await result.current.toUrlPath(pictogramNumber, skin);

      expect(path).toStrictEqual(expectPath);
    });
  });

  describe("When getSettingsPictId it's called with pictogramID and indexSequence", () => {
    test("Then called dispatch expect action creator", async () => {
      mockSelector = { skin: "white" };

      const expectAction = {
        payload: {
          indexSequence: 0,
          settings: { skin: "white", fitzgerald: "#229900" },
        },
        type: "sequence/settingsPictApiAra",
      };

      const { result } = renderHook(() => useAraSaac());

      await result.current.getSettingsPictId(555, 0);

      expect(mockDispatch).toHaveBeenCalledWith(expectAction);
    });
  });
});
