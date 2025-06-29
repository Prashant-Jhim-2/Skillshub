import Clientside from './clientside'


export default async function Home({params}) {
   const {id} = params
  // Fetch data server-side
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Verify/${id}`)
  const Response = await Request.json()
   const data = {
    status : Response.status ,
    Email : Response.Email ,
    Details : Response.Details ,
    Type :  Response.Type 
   }
  return (
    <>
     
      <Clientside  data = {data}/>
    </>
  );
}
