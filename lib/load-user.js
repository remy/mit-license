import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {loadJsonFile} from 'load-json-file'

const directoryName = path.dirname(fileURLToPath(import.meta.url))

const loadUser = async hostname => {
  const [id] = hostname.split('.')

  // Fallback
  const user = {
    copyright: '<copyright holders>',
    format: 'html',
    license: 'MIT',
  }

  try {
    return {
      ...user,
      ...await loadJsonFile(path.join(directoryName, '..', 'users', `${id}.json`)),
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return user
    }

    throw error
  }
}

export default loadUser
