var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm
var ARGUMENT_NAMES = /([^\s,]+)/g

function getParamNames(func) {
  if (!func) {
    throw Error(`An exposed function not found.`)
  }

  var fnStr = func.toString().replace(STRIP_COMMENTS, '')

  var result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(ARGUMENT_NAMES)

  if (result === null) result = []

  const cleanedParams = result
    .map((param) => {
      if (param.startsWith('{')) {
        return param
          .replace(/[{}]/g, '')
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      }
      return param.trim()
    })
    .flat()
    .filter((param) => param !== '' && param !== '}')

  return cleanedParams
}

module.exports = getParamNames
