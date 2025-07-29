"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import { ExtendedUser, Loot, WorldCell } from '@/lib/types'
import { getMe, getUser, initializeUserPosition, updateUser } from '@/actions/user'
import { fetchWorldCellsInArea, fetchWorldCell } from '@/actions/worldCell'
import { createAndAddObjectToInventory } from '@/actions/object'
import { Prisma } from '@/app/generated/prisma'
import { createUserTrace } from '@/actions/traces'

interface UserState {
  user: ExtendedUser | null
  userWorldCell: WorldCell | null
  surroundingCells: {
    north?: WorldCell
    south?: WorldCell
    east?: WorldCell
    west?: WorldCell
  }
  inventory: Loot[]
  loading: boolean
  error: string | null
}

interface UserContextType extends UserState {
  setUser: (user: ExtendedUser | null) => void
  setUserWorldCell: (worldCell: WorldCell) => void
  setSurroundingCells: (surroundingCells: {
    north?: WorldCell
    south?: WorldCell
    east?: WorldCell
    west?: WorldCell
  }) => void
  setInventory: (inventory: Loot[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getUser: (id: Prisma.UserWhereUniqueInput) => Promise<void>
  updateUser: (id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => Promise<void>
  getMe: () => Promise<void>
  moveUser: (direction: string, worldCell?: Partial<WorldCell>) => Promise<void>
  updateSurroundingCells: () => Promise<void>
  addObjectToInventory: (objectData: { name: string; description: string }) => Promise<void>
}

type UserAction =
  | { type: 'SET_USER'; payload: ExtendedUser | null }
  | { type: 'SET_USER_WORLD_CELL'; payload: WorldCell }
  | { type: 'SET_SURROUNDING_CELLS'; payload: { north?: WorldCell; south?: WorldCell; east?: WorldCell; west?: WorldCell } }
  | { type: 'SET_INVENTORY'; payload: Loot[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const UserContext = createContext<UserContextType | undefined>(undefined)

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_USER_WORLD_CELL':
      return { ...state, userWorldCell: action.payload }
    case 'SET_SURROUNDING_CELLS':
      return { ...state, surroundingCells: action.payload }
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// 💾 Helper functions for localStorage persistence
const USER_STORAGE_KEY = 'user-storage'

const loadFromStorage = (): Partial<UserState> => {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.state || {}
    }
  } catch (error) {
    console.error('👤 Failed to load user from storage:', error)
  }
  return {}
}

const saveToStorage = (state: UserState) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
      state,
      version: 0
    }))
  } catch (error) {
    console.error('👤 Failed to save user to storage:', error)
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    userWorldCell: null,
    surroundingCells: {},
    inventory: [],
    loading: false,
    error: null
  })

  // 🔄 Load from localStorage on mount
  useEffect(() => {
    const storedState = loadFromStorage()
    if (Object.keys(storedState).length > 0) {
      Object.entries(storedState).forEach(([key, value]) => {
        switch (key) {
          case 'user':
            dispatch({ type: 'SET_USER', payload: value as ExtendedUser | null })
            break
          case 'userWorldCell':
            setUserWorldCell(value as WorldCell)
            break
          case 'surroundingCells':
            dispatch({ type: 'SET_SURROUNDING_CELLS', payload: value as { north?: WorldCell; south?: WorldCell; east?: WorldCell; west?: WorldCell } })
            break
          case 'inventory':
            dispatch({ type: 'SET_INVENTORY', payload: value as Loot[] })
            break
        }
      })
    }
  }, [])

  // 💾 Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(state)
  }, [state])

  // 🎯 Memoized setter functions
  const setUser = useCallback((user: ExtendedUser | null) => {
    dispatch({ type: 'SET_USER', payload: user })
  }, [])

  const setUserWorldCell = useCallback(async (worldCell: WorldCell) => {
    const userWorldCell = await fetchWorldCell(worldCell.x, worldCell.y)
    dispatch({ type: 'SET_USER_WORLD_CELL', payload: userWorldCell || worldCell })
  }, [])

  const setSurroundingCells = useCallback((surroundingCells: {
    north?: WorldCell
    south?: WorldCell
    east?: WorldCell
    west?: WorldCell
  }) => {
    dispatch({ type: 'SET_SURROUNDING_CELLS', payload: surroundingCells })
  }, [])

  const setInventory = useCallback((inventory: Loot[]) => {
    dispatch({ type: 'SET_INVENTORY', payload: inventory })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  // 🎯 Memoized async functions
  const updateSurroundingCells = useCallback(async () => {
    if (!state.user?.worldCell) {
      console.log('📍 No user position, skipping surrounding cells update')
      return
    }

    try {
      console.log(`🔍 Fetching surrounding cells for position (${state.user.worldCell.x}, ${state.user.worldCell.y})`)

      const allCells = await fetchWorldCellsInArea(
        state.user.worldCell.x - 1,
        state.user.worldCell.x + 1,
        state.user.worldCell.y - 1,
        state.user.worldCell.y + 1
      )

      const surroundingCells: {
        north?: WorldCell
        south?: WorldCell
        east?: WorldCell
        west?: WorldCell
      } = {}

      const userX = state.user.worldCell.x
      const userY = state.user.worldCell.y

      allCells.forEach(cell => {
        if (cell.x === userX && cell.y === userY) return

        if (cell.x === userX && cell.y === userY + 1) {
          surroundingCells.north = cell
        } else if (cell.x === userX && cell.y === userY - 1) {
          surroundingCells.south = cell
        } else if (cell.x === userX + 1 && cell.y === userY) {
          surroundingCells.east = cell
        } else if (cell.x === userX - 1 && cell.y === userY) {
          surroundingCells.west = cell
        }
      })

      setUserWorldCell(state.user.worldCell)
      console.log(`✅ Updated surrounding cells:`, {
        north: surroundingCells.north?.title || 'empty',
        south: surroundingCells.south?.title || 'empty',
        east: surroundingCells.east?.title || 'empty',
        west: surroundingCells.west?.title || 'empty'
      })

    } catch (error) {
      console.error('❌ Error updating surrounding cells:', error)
      dispatch({ type: 'SET_ERROR', payload: error as string })
    }
  }, [state.user?.worldCell])

  const getUserData = useCallback(async (id: Prisma.UserWhereUniqueInput) => {
    try {
      const user = await getUser(id)
      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as string })
    }
  }, [])

  const updateUserData = useCallback(async (id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => {
    try {
      const user = await updateUser(id, data)
      dispatch({ type: 'SET_USER', payload: user })

      // Update surrounding cells and inventory
      if (user?.worldCell) {
        const allCells = await fetchWorldCellsInArea(
          user.worldCell.x - 1,
          user.worldCell.x + 1,
          user.worldCell.y - 1,
          user.worldCell.y + 1
        )

        const surroundingCells: {
          north?: WorldCell
          south?: WorldCell
          east?: WorldCell
          west?: WorldCell
        } = {}

        const userX = user.worldCell.x
        const userY = user.worldCell.y

        allCells.forEach(cell => {
          if (cell.x === userX && cell.y === userY) return

          if (cell.x === userX && cell.y === userY + 1) {
            surroundingCells.north = cell
          } else if (cell.x === userX && cell.y === userY - 1) {
            surroundingCells.south = cell
          } else if (cell.x === userX + 1 && cell.y === userY) {
            surroundingCells.east = cell
          } else if (cell.x === userX - 1 && cell.y === userY) {
            surroundingCells.west = cell
          }
        })

        setSurroundingCells(surroundingCells)
        setUserWorldCell(user.worldCell)
        dispatch({ type: 'SET_INVENTORY', payload: user.inventory || [] })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as string })
    }
  }, [])

  const getMeData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      console.log('🔄 Fetching user data...')

      const user = await getMe()
      dispatch({ type: 'SET_USER', payload: user })

      if (!user) return

      if (user?.worldCell) {
        // Update surrounding cells
        const allCells = await fetchWorldCellsInArea(
          user.worldCell.x - 1,
          user.worldCell.x + 1,
          user.worldCell.y - 1,
          user.worldCell.y + 1
        )

        const surroundingCells: {
          north?: WorldCell
          south?: WorldCell
          east?: WorldCell
          west?: WorldCell
        } = {}

        const userX = user.worldCell.x
        const userY = user.worldCell.y

        allCells.forEach(cell => {
          if (cell.x === userX && cell.y === userY) return

          if (cell.x === userX && cell.y === userY + 1) {
            surroundingCells.north = cell
          } else if (cell.x === userX && cell.y === userY - 1) {
            surroundingCells.south = cell
          } else if (cell.x === userX + 1 && cell.y === userY) {
            surroundingCells.east = cell
          } else if (cell.x === userX - 1 && cell.y === userY) {
            surroundingCells.west = cell
          }
        })

        setSurroundingCells(surroundingCells)
        dispatch({ type: 'SET_INVENTORY', payload: user.inventory || [] })
        setUserWorldCell(user.worldCell)
      }

      if (!user?.worldCell) {
        await initializeUserPosition(user.id)
      }

      console.log('✅ User data fetched successfully')
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
      dispatch({ type: 'SET_ERROR', payload: error as string })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const moveUser = useCallback(async (direction: string) => {
    if (!state.user || !state.user.worldCell) {
      console.error('❌ User or world cell not found')
      return
    }

    let newX = state.user.worldCell.x
    let newY = state.user.worldCell.y

    if (direction === 'north') newY++
    if (direction === 'south') newY--
    if (direction === 'east') newX++
    if (direction === 'west') newX--

    //generate a trace
    await createUserTrace(state.user.id, state.user.worldCell.id, 'FOOTPRINT', 'Moved ' + direction)

    await updateUserData({ id: state.user.id }, {
      worldCell: { connect: { x_y: { x: newX, y: newY } } }
    })
  }, [state.user, updateUserData])

  const addObjectToInventory = useCallback(async (objectData: { name: string; description: string }) => {
    if (!state.user?.id) {
      console.error('❌ No user found for inventory operation')
      dispatch({ type: 'SET_ERROR', payload: 'No user found' })
      return
    }

    try {
      console.log('🎒 Adding object to inventory:', objectData.name)

      const updatedUser = await createAndAddObjectToInventory(state.user.id, objectData)

      if (updatedUser) {
        dispatch({ type: 'SET_USER', payload: updatedUser })
        dispatch({ type: 'SET_INVENTORY', payload: updatedUser.inventory || [] })
        console.log('✅ Loot added to inventory and user updated')
      } else {
        throw new Error('Failed to add object to inventory')
      }

    } catch (error) {
      console.error('❌ Error adding object to inventory:', error)
      dispatch({ type: 'SET_ERROR', payload: error as string })
    }
  }, [state.user?.id])

  const value: UserContextType = {
    ...state,
    setUser,
    setUserWorldCell,
    setSurroundingCells,
    setInventory,
    setLoading,
    setError,
    getUser: getUserData,
    updateUser: updateUserData,
    getMe: getMeData,
    moveUser,
    updateSurroundingCells,
    addObjectToInventory
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}