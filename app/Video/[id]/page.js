import Clientside from './ClientSide'


export default async function Home({params}) {
   const {id} = params
  // Fetch data server-side
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/VideoDetail/${id}`)
  const Response = await Request.json()
  var Details = []
  if (Response.status == true){
    Details = Response.data
  }
  // Part where it fetch all questions 
  const Requestforquestions = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Questions/${id}`)
  const Responseforquestions = await Requestforquestions.json()
  var arr
  if (Responseforquestions.status == true){
    arr = Responseforquestions.data
  }
  else {
    arr = []
  }
  const Data = {
    id : id ,
    Questions:arr,
    Details
   }
  return (
    <>
     
      <Clientside Data={Data} />
    </>
  );
}
