import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { sequenceReducer } from "./slice/sequenceSlice";
import { uiReducer } from "./slice/uiSlice";

export const store = configureStore({
  reducer: {
    sequence: sequenceReducer,
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
