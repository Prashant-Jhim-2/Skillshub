import Clientside from './client'


export default async function Page() {
 
const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CommunityChats`)
const Response = await Request.json()

const Data = Response.Data
 
  return (
    <>
      <Clientside data = {Data}  />
     
    </>
  );
}

