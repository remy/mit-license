export default function isDomainIdLike(value) {
  if (typeof value !== 'string') {
    return false
  }

  return /^[\w-_]+$/.test(value)
}
