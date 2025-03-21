import Clientside from './ClientSide'


export default async function Home({params}) {
 const {id} = params
 
   // Fetch data server-side
  const Request =  await fetch(`${process.env.NEXT_PUBLIC_PORT}/Card/${id}`, {
    method: "GET", // Use GET for ISR
   });
  const Response = await Request.json()
  

  // Fetch To Get Videos 
  const RequestforVideos = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetVideos/${id}`)
  const ResponseforVideos = await RequestforVideos.json()
  const arrofvideos = ResponseforVideos.data 
  console.log(arrofvideos)
  const Data  = {
    Details : Response.data,
    CourseID:id ,
    videos:arrofvideos
  }
 
  return (
    <>
      <Clientside data={Data} />
     
    </>
  );
}
