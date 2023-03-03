import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { sequenceReducer } from "./slice/sequenceSlice";

export const store = configureStore({
  reducer: {
    sequence: sequenceReducer,
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
