import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from '@e2b/code-interpreter'
import { getsandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step}) => {
    const sandboxId = await step.run("get-sandbox-id" , async () => {
      const sandbox = await Sandbox.create("silo-nextjs-rishi");
      return sandbox.sandboxId;
    });
    
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert nextjs developer. You write readable,maintainable code. You write simple Next.js & React snippets",
      model: openai({ model: "gpt-4o"}),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );

    const sandboxUrl = await step.run("get-sandbox-id" , async () => {
      const sandbox = await getsandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });


    return {output , sandboxUrl};
  },
);

