import Clientside from './client'


export default async function Home({params}) {
   const {id} = params
  // Fetch data server-side
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Profile`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})
  })
  const Response = await Request.json()
  var ProfileDetails = Response.data 
  var CareerDetails 
  if (ProfileDetails.Type == "Professor"){
    // Fetch Professor Application 
  const Requestforprofessor = await fetch(`${process.env.NEXT_PUBLIC_PORT}/ProfessorDetails/${ProfileDetails.id}`)
  const Responseforprofessor = await Requestforprofessor.json()  
   CareerDetails = {
    id:Responseforprofessor.data.id ,
    Certifications : Responseforprofessor.data.Certifications ,
    Education : Responseforprofessor.data.Educationdetails ,
    Work:Responseforprofessor.data.Work
   }
}


// Final Object To Pash ON
const DetailsOfProfessor = {
  Info : ProfileDetails,
  CareerDetails : CareerDetails
}

  return (
    <>
     
      <Clientside  details={DetailsOfProfessor} />
    </>
  );
}
