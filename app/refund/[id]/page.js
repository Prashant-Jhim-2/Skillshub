import Clientside from './clientside'


export default async function Home({params}) {
   const {id} = params
  // Fetch data server-side
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Payment/${id}`)
  const Response = await Request.json()
  const data = Response.data
  return (
    <>
     
      <Clientside  data = {data[0]}/>
    </>
  );
}
