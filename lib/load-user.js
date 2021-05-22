import {fileURLToPath} from 'node:url'
import path, {dirname} from 'node:path'
import loadJsonFile from 'load-json-file'

const directoryName = dirname(fileURLToPath(import.meta.url))

const loadUser = async hostname => {
  const [id] = hostname.split('.')

  const user = {
    copyright: '<copyright holders>' // Fallback
  }

  try {
    return {
      ...user,
      ...await loadJsonFile(path.join(directoryName, '..', 'users', `${id}.json`))
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

export default loadUser
