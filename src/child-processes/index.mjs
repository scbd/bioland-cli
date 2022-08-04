import { getAllUserArgs } from '../util/index.mjs'

runTaskAsChildProcess()

async function runTaskAsChildProcess(){
  const { commandParamCase, branch, commandArgs } = getAllUserArgs()
  const   taskFunction                            = (await import(`../tasks/${commandParamCase}.mjs`)).default

  taskFunction(branch, commandArgs)
}