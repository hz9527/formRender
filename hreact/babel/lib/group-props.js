const makeMap = require('./make-map')
const isTopLevel = makeMap('class,staticClass,style,key,ref,refInFor,slot,scopedSlots')
const nestableRE = /^(props|domProps|on|nativeOn|hook)([\-_A-Z])/
const dirRE = /^v-/
const xlinkRE = /^xlink([A-Z])/

module.exports = function groupProps (props, t) {
  const newProps = []
  const currentNestedObjects = Object.create(null)
  props.forEach(function (prop) {
    let name = prop.key.value || prop.key.name
    if (isTopLevel(name)) {
      // top-level special props
      newProps.push(prop)
    } else {
      // nested modules
      const nestMatch = name.match(nestableRE)
      if (nestMatch) {
        const prefix = nestMatch[1]
        const suffix = name.replace(nestableRE, function (_, $1, $2) {
          return $2 === '-' ? '' : $2.toLowerCase()
        })
        const nestedProp = t.objectProperty(t.stringLiteral(suffix), prop.value)
        let nestedObject = currentNestedObjects[prefix]
        if (!nestedObject) {
          nestedObject = currentNestedObjects[prefix] = t.objectProperty(
            t.identifier(prefix),
            t.objectExpression([nestedProp])
          )
          newProps.push(nestedObject)
        } else {
          nestedObject.value.properties.push(nestedProp)
        }
      } else if (dirRE.test(name)) {
        // custom directive
        name = name.replace(dirRE, '')
        let dirs = currentNestedObjects.directives
        if (!dirs) {
          dirs = currentNestedObjects.directives = t.objectProperty(
            t.identifier('directives'),
            t.arrayExpression([])
          )
          newProps.push(dirs)
        }
        dirs.value.elements.push(t.objectExpression([
          t.objectProperty(
            t.identifier('name'),
            t.stringLiteral(name)
          ),
          t.objectProperty(
            t.identifier('value'),
            prop.value
          )
        ]))
      } else {
        // rest are nested under attrs
        let attrs = currentNestedObjects.attrs
        // guard xlink attributes
        if (xlinkRE.test(prop.key.name)) {
          prop.key.name = JSON.stringify(prop.key.name.replace(xlinkRE, function (m, p1) {
            return 'xlink:' + p1.toLowerCase()
          }))
        }
        if (!attrs) {
          attrs = currentNestedObjects.attrs = t.objectProperty(
            t.identifier('attrs'),
            t.objectExpression([prop])
          )
          newProps.push(attrs)
        } else {
          attrs.value.properties.push(prop)
        }
      }
    }
  })
  return t.objectExpression(newProps)
}
