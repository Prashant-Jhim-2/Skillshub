import Clientside from './ClientSide'


export default async function Home({params}) {
   const {id} = params
  // Fetch data server-side
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Profile`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})
  })
  const Response = await Request.json()

  return (
    <>
     
      <Clientside profiledetails={Response.data} />
    </>
  );
}
