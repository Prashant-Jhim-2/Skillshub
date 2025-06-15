import Clientside from './ClientSide'

export default async function Home({params}) {
  const {id} = params
 
  // Fetch data server-side
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Card/${id}`, {
    method: "GET", // Use GET for ISR
  });
  const Response = await Request.json()

  // Fetch chapter data
  const chapterRequest = await fetch(`${process.env.NEXT_PUBLIC_PORT}/chapters/${id}`)
  const chapterResponse = await chapterRequest.json()
  const chapterData = chapterResponse.data

  const Data = {
    Details: Response.data,
    CourseID: id,
    chapterData: chapterData
  }
 
  return (
    <>
      <Clientside data={Data} />
    </>
  );
}
