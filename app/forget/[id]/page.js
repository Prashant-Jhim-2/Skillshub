import Clientside from './clientside'


export default async function Home({params}) {
  const {id} = params
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Forget/${id}`)
  const Response = await Request.json()
  const Details = {
    Email :Response.Email,
    status : Response.status 
  }
  console.log(Details)
  return (
    <>
     
      <Clientside Details ={Details}  />
    </>
  );
}
