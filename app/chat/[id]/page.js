
import Clientside from './client'


export default async function Page({params}) {
  const {id} = params
 
const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Chat/${params.id}`)
const Response = await Request.json()
 
console.log(Response)
  return (
    <>
      <Clientside Responsefromserver = {Response}  />
     
    </>
  );
}

