import {useContext, createContext, useReducer} from 'react'
import initialState from './state'
import reducer from './reducer'

export const bookContext = createContext()

export const useBookContext = () => {
  const context = useContext(bookContext)
  if (context === undefined)
    throw new Error('useBookContext must be used within BookProvider')
  return context
}

export const BookProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <bookContext.Provider {...props} value={[state, dispatch]} />
}