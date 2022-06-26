#!/usr/bin/env node

// const chalk = require('chalk')
// const argv = require('minimist')(process.argv.slice(2))

import chalk from 'chalk'
import minimist from 'minimist'
import fetch from 'node-fetch'
import { getGitUser, logger } from '../utils/index.js'

const argv = minimist(process.argv.slice(2))
const API = 'https://api.github.com/user'

// args, -p set public repo, nossh: to get clone URL vs ssh_URL
const { p, nossh } = argv

if (argv._.length !== 1) {
  logger(`${chalk.red.bold('ERR')}: no repo name was given`)
  process.exit(1)
}

const repo_name = argv._[0]

p ? logger('Settings repo to public') : ''

const main = async () => {
  const USER_NAME = getGitUser()
  const USER_TOKEN = process.env.CR_PAT || process.env.GITHUB_TOKEN || null

  if (!USER_TOKEN) {
    logger('ERR: no Github token (no GITHUB_TOKEN or CR_PAT env)')
    process.exit(2)
  }

  const USER_AUTH = Buffer.from(`${USER_NAME}:${USER_TOKEN}`).toString('base64')
  const payload = {
    name: repo_name,
    'private': p ? false : true
  }
  console.log('sent', JSON.stringify(payload))
  const res = await fetch(`${API}/repos`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${USER_AUTH}`
    },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  return await res
}

try {
  const res = await main()

  if (nossh) {
    console.log(
      `>> ${chalk.green('Run:')}
  git remote add origin ${res.clone_url}
  git branch -M main
  git push -u origin main`
    )
  } else {
    console.log(
      `>> ${chalk.green('Run:')}
  git remote add origin ${res.ssh_url}
  git branch -M main
  git push -u origin main`
    )
  }
} catch (err) {
  console.error(err)
  process.exit(4)
}
