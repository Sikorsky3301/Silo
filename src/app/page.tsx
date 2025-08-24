import { prisma } from "@/lib/db";

const Page = async () => {

  const posts = await prisma.post.findMany();
  return (
    <div>
      {JSON.stringify(posts , null , 2)}
    </div>
  );
};

export default Page;