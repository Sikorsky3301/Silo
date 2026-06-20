import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useRef } from "react";
import { useEffect } from "react";
import { Fragment } from "@/generated/prisma";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment) => void;
}




export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {
    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement>(null);
    const { data: messages } = useSuspenseQuery({
        ...trpc.messages.getmany.queryOptions({ projectId }),
        refetchInterval: 3000,
    });



///////////////////////////////EDITED/////////////////////////////////////////////////////////////////
    useEffect(() => {
        const lastAssistantMessage = messages.findLast((message) => message.role === "ASSISTANT");

        if(lastAssistantMessage && lastAssistantMessage.fragment) {
           // TODO : Set active fragment 
           setActiveFragment(lastAssistantMessage.fragment);
        }
    }, [messages , setActiveFragment]);
//////////////////////////////////////////////////////////////////////////////////////////////////////


    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className= "pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard key={message.id} 
                        content={message.content} 
                        role={message.role} 
                        fragment={message.fragment} 
                        createdAt={message.createdAt}
                        isActiveFragment={activeFragment?.id === message.fragment?.id}
                        onFragmentClick={() => setActiveFragment(message.fragment as Fragment)}
                        type = {message.type}/>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className=" relative p-3 pt-1">
                <div className= "absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none"/>
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
};