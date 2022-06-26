import { execute } from './execute.js'

async function getGitUser() {
  try {
    const user = await execute('git config --global user.namex')
    console.log(user)
    return user
  } catch (err) {
    console.log(`Can't read git username`)
    process.exit(-3)
  }
}

const logger = msg => console.log('>>', msg)

export {
  getGitUser,
  logger
}

export {
  execute
} from './execute.js'
