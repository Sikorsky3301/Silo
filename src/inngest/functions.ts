import { inngest } from "./client";
import { openai, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox} from '@e2b/code-interpreter'
import { getsandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("silo-nextjs-rishi");
      return sandbox.sandboxId;
    });

// ....................AGENT SETUP....................
    const codeAgent = createAgent({
      name: "code-agent",
      description: "An Expert Coding Agent",
      system: PROMPT,
      model: openai({ 
        model: "gpt-4.1", 
        defaultParameters: {
          temperature: 0.1,
        },
      }),


      tools: [
        createTool({
          name: "Terminal",
          description: "use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getsandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  }
                });
                return result.stdout;
              } catch (error) {
                console.error(`Command Failed : ${error}\nstdout:${buffers.stdout}\nstderror:${buffers.stderr}`,
                );
                return `Command Failed : ${error}\nstdout:${buffers.stdout}\nstderror:${buffers.stderr}`;
              }
            })
          },
          
        }),
        createTool({ name: "createorupdatefiles", 
          description:"create or update files in the sandbox",
          parameters:z.object({
            files: z.array(
              z.object({
                path:z.string(),
                content:z.string(),
              }),
            ),
          }), 
          handler : async ({files} , {step,network}) =>{
            const newFiles = await step?.run("createOrUpdateFiles" , async () => {
              try {   
                const updatedFiles = network.state.data.files || {} ;
                const sandbox = await getsandbox(sandboxId);
                for(const file of files ) {
                  await sandbox.files.write(file.path , file.content);
                  updatedFiles[file.path] = file.content;
                  return updatedFiles;
                }
              } catch (error) {
                return "Error: " + error;
              }
            });
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          }
        }),


        
        createTool({
          name : "readFiles",
          description : "read files from the sandbox",
          parameters : z.object({
            files : z.array(z.string()),
          }),
          handler : async ( {files} , {step} ) => {
            return await step?.run("readFiles" , async () => {
              try {
                const sandbox = await getsandbox(sandboxId);
                const contents = [];
                for(const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({path: file, content});
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            })
          }
        })
      ],



      lifecycle: {
        onResponse: async ({result, network}) => {
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network ) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });


    const network = createNetwork({
      name : "coding-agent-network",
      agents : [codeAgent],
      maxIter : 15,
      router : async ({network}) => {
        const summary = network.state.data.summary;

        if (summary){
          return;
        }

        return codeAgent;
      }
    })


    // const { output } = await codeAgent.run(
    //   `Write the following snippet: ${event.data.value}`,
    // );


    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-id", async () => {
      const sandbox = await getsandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });


    return { 
      url : sandboxUrl,
      title : "Fragment",
      files : result.state.data.files,
      summary : result.state.data.summary,


     };
  },
);

