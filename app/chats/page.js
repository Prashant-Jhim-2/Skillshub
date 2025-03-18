import Clientside from './client'


export default async function Page() {
 
const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/AllUsers`)
const Response = await Request.json()

const Data = Response.data
 
  return (
    <>
      <Clientside data = {Data}  />
     
    </>
  );
}

