import Clientside from './ClientSide'



export default async function Home() {
  
    var Data = []

 // Function to Fetch All Alerts 
 const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Alerts`)
 const Response = await Request.json()
 if (Response.status == true){
    Data = Response.Data 
 }

  return (
    <>
     
      <Clientside Data = {Data} />
    </>
  );
}
