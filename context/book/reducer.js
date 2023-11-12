import * as actions from './actions'

export default function reducer(state, {action, payload}) {
  switch(action) {
    case actions.SEARCH_BOOKS:
      return {...state, bookSearchResults: payload}
    default:
      return state
  }
}