module.exports = function makeMap (str) {
  let map = Object.create(null)
  let list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return val => map[val]
}
