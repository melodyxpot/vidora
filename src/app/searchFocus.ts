let pending = false

export function requestSearchFocus() {
  pending = true
}

export function consumeSearchFocus() {
  const shouldFocus = pending
  pending = false
  return shouldFocus
}
