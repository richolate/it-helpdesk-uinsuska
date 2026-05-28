// Auth composable — dummy accounts & session management

export interface UserAccount {
  nimNip: string
  password: string
  nama: string
  role: 'Mahasiswa' | 'Dosen' | 'Admin IT'
  /** Which portal this account belongs to */
  portalType: 'user' | 'admin'
}

/** Dummy accounts (in a real app these would come from an API) */
const ACCOUNTS: UserAccount[] = [
  {
    nimNip: '12001',
    password: 'mahasiswa1',
    nama: 'Budi Siregar',
    role: 'Mahasiswa',
    portalType: 'user',
  },
  {
    nimNip: '13001',
    password: 'dosen123',
    nama: 'Bagus Hartono',
    role: 'Dosen',
    portalType: 'user',
  },
  {
    nimNip: '14001',
    password: 'admin123',
    nama: 'Agus Salim',
    role: 'Admin IT',
    portalType: 'admin',
  },
]

const SESSION_KEY = 'auth_user'

export function useAuth() {
  /** Attempt login. Returns the matching account or null. */
  function login(
    nimNip: string,
    password: string,
    portalType: 'user' | 'admin',
  ): UserAccount | null {
    const account = ACCOUNTS.find(
      (a) =>
        a.nimNip === nimNip.trim() &&
        a.password === password &&
        a.portalType === portalType,
    )
    if (account) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(account))
    }
    return account ?? null
  }

  /** Remove session */
  function logout() {
    localStorage.removeItem(SESSION_KEY)
  }

  /** Get the currently logged-in user (or null) */
  function getCurrentUser(): UserAccount | null {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserAccount
    } catch {
      return null
    }
  }

  /** Is anyone logged in? */
  function isAuthenticated(): boolean {
    return getCurrentUser() !== null
  }

  /** Is the logged-in user from the user portal? */
  function isUserPortal(): boolean {
    return getCurrentUser()?.portalType === 'user'
  }

  /** Is the logged-in user an admin? */
  function isAdminPortal(): boolean {
    return getCurrentUser()?.portalType === 'admin'
  }

  return {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    isUserPortal,
    isAdminPortal,
  }
}
