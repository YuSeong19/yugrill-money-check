import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, set, remove, onValue } from 'firebase/database'

export const SECRET_KEY = 'yg-k9x2mQ7rLpW4vN8sA3fE'

const firebaseConfig = {
  apiKey:            "AIzaSyA0qa87ggw5zEml4VjHJl-mCJyYjJVOP28",
  authDomain:        "yugrill-money-a33ee.firebaseapp.com",
  databaseURL:       "https://yugrill-money-a33ee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "yugrill-money-a33ee",
  storageBucket:     "yugrill-money-a33ee.firebasestorage.app",
  messagingSenderId: "488608486415",
  appId:             "1:488608486415:web:8b50d77a9e2f66326a7f7a",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const db         = getDatabase(app)
export const recordsRef = ref(db, `shops/${SECRET_KEY}/records`)
export const pinRef     = ref(db, `shops/${SECRET_KEY}/settings/pin`)
export { ref, set, remove, onValue }
