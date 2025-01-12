import Clientside from './ClientSide'


export default async function Home({params}) {
 const {id} = params
 
  // Fetch data server-side
  const Request =  await fetch(`${process.env.NEXT_PUBLIC_PORT}/Card/${id}`, {
    method: "GET", // Use GET for ISR
   
  });
  const Response = await Request.json()
  console.log(Response.data)
 
  return (
    <>
      <Clientside DataofCard={Response.data} />
     
    </>
  );
}
