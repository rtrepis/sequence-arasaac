import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import { documentReducer } from "@features/sequence/store/documentSlice";

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
