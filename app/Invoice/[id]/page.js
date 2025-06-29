import Clientside from './client'


export default async function Home({params}) {
  const {id} = params
 
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/PaymentDetails`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({id})})
    
  const Response = await Request.json() 
  const Details = Response.data
  return (
    <>
     
      <Clientside Details ={Details}  />
    </>
  );
}
