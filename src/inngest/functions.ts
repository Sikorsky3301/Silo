import { inngest } from "./client";
import { openai, createAgent, createTool, createNetwork, Agent, type Tool } from "@inngest/agent-kit";
import { Sandbox} from '@e2b/code-interpreter'
import { getsandbox, lastAssistantTextMessageContent } from "@/inngest/utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";
import {prisma} from "@/lib/db"

interface AgentState {
  summary : string;
  files: {[path : string] : string};
  
}


export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("silo-nextjs-rishi");
      return sandbox.sandboxId;
    });

// ....................AGENT SETUP....................
    const codeAgent = createAgent<AgentState>({
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
          handler : async ({files} , {step,network}: Tool.Options<AgentState>) =>{
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


    const network = createNetwork<AgentState>({
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

    const isError = 
    !result.state.data.summary || 
    Object.keys(result.state.data.files || {}).length === 0 ;

    const sandboxUrl = await step.run("get-sandbox-id", async () => {
      const sandbox = await getsandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result" , async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content : "Something went wrong. Please Try Again.",
            role : "ASSISTANT",
            type : "ERROR",
          },
        });
      }


      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content : result.state.data.summary,
          role : "ASSISTANT" , 
          type : "RESULT",
          fragment : {
            create : {
              sandboxUrl : sandboxUrl,
              title : "Fragment",
              files : result.state.data.files,
            },
          },
        },
      })
    });


    return { 
      url : sandboxUrl,
      title : "Fragment",
      files : result.state.data.files,
      summary : result.state.data.summary,


     };
  },
);

