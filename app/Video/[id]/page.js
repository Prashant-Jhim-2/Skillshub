import Clientside from './ClientSide'


export default async function Home({params}) {
   const {id} = params
  // Fetch data server-side

  // Part where it fetch all questions 
  const Requestforquestions = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Questions/${id}`)
  const Responseforquestions = await Requestforquestions.json()
  var arr = []
  if (Responseforquestions.status == true){
    arr = Responseforquestions.data
  }
  const Data = {
    id : id ,
    Questions:arr
   }
  return (
    <>
     
      <Clientside Data={Data} />
    </>
  );
}
