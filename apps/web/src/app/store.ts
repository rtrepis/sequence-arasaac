import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import { documentReducer } from "@features/sequence/store/documentSlice";
import { documentStatusReducer } from "@features/sequence/store/documentStatusSlice";
import { documentStatusListener } from "@features/sequence/store/documentStatusMiddleware";
import { authReducer } from "@features/backend/auth/store/authSlice";

export const store = configureStore({
  reducer: {
    document: documentReducer,
    documentStatus: documentStatusReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(documentStatusListener.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
