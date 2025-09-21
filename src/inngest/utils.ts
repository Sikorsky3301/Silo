import { Sandbox } from '@e2b/code-interpreter'

export async function getsandbox(sandboxId: string){
    const sandbox = await Sandbox.connect(sandboxId)
    return sandbox;
}