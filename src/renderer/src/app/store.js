import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authSlice from '../Features/authSlice'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import persistStore from 'redux-persist/es/persistStore'
// import appSlice from '../Features/appSlice'

const persistConfig = {
  key: 'root',
  version: 1,
  storage
}

const allReducers = combineReducers({
  auth: authSlice
  // app: appSlice
})

const store = configureStore({
  reducer: persistReducer(persistConfig, allReducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

const persistor = persistStore(store)

export { store, persistor }
