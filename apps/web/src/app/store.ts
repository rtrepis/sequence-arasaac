import {
  configureStore,
  combineReducers,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit";
import { uiReducer } from "@features/user-settings/store/uiSlice";
import { documentReducer } from "@features/sequence/store/documentSlice";
import { documentStatusReducer } from "@features/sequence/store/documentStatusSlice";
import { documentStatusListener } from "@features/sequence/store/documentStatusMiddleware";
import { authReducer } from "@features/backend/auth/store/authSlice";
import { quotaReducer } from "@features/backend/user-settings/store/quotaSlice";
import { styleReducer } from "@features/sequence/store/styleSlice";

const rootReducer = combineReducers({
  document: documentReducer,
  documentStatus: documentStatusReducer,
  ui: uiReducer,
  auth: authReducer,
  quota: quotaReducer,
  style: styleReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Únic lloc on es declara de què està fet l'estat de l'app.
 *
 * L'app en fa una instància i els tests en fan una de nova per cada cas: amb el
 * mapa de reducers escrit dues vegades, l'arnès de proves es desincronitzava de
 * l'store real i els tests comprovaven un model que ja no existia.
 */
export const createAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(documentStatusListener.middleware),
  });

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
