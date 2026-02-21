import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { uiReducer } from "./slice/uiSlice";
import { documentReducer } from "./slice/documentSlice";

export const store = configureStore({
  reducer: {
    document: documentReducer,
    ui: uiReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
