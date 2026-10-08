import { createSlice } from '@reduxjs/toolkit'

// Load selected persisted state from localStorage
const loadPersistedUser = () => {
  try {
    const serialized = localStorage.getItem('futureme_user')
    return serialized ? JSON.parse(serialized) : null
  } catch (err) {
    console.warn('Failed to load user from localStorage', err)
    return null
  }
}

// Load selected user preferences (e.g. rememberEmail, lastSelectedRole)
const loadPreferences = () => {
  try {
    const prefs = localStorage.getItem('futureme_prefs')
    return prefs ? JSON.parse(prefs) : { rememberEmail: '', lastSelectedRole: 'STUDENT' }
  } catch {
    return { rememberEmail: '', lastSelectedRole: 'STUDENT' }
  }
}

const initialUser = loadPersistedUser()

const initialState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  preferences: loadPreferences(),
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload
      state.user = user
      state.isAuthenticated = true

      // Persist selected user cache in localStorage
      try {
        localStorage.setItem('futureme_user', JSON.stringify(user))
      } catch (err) {
        console.error('Failed to save user to localStorage', err)
      }
    },
    logoutUser: (state) => {
      state.user = null
      state.isAuthenticated = false

      // Remove user cache from localStorage
      try {
        localStorage.removeItem('futureme_user')
      } catch (err) {
        console.error('Failed to remove user from localStorage', err)
      }
    },
    savePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
      try {
        localStorage.setItem('futureme_prefs', JSON.stringify(state.preferences))
      } catch (err) {
        console.error('Failed to save preferences to localStorage', err)
      }
    },
  },
})

export const { setCredentials, logoutUser, savePreferences } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectPreferences = (state) => state.auth.preferences

export default authSlice.reducer
