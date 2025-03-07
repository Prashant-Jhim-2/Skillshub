import Clientside from './client'


export default async function Page() {
 
 // Function to Get Refunds Request 
 const Requestforrefunds = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Refunds`)
 const Responseforrefunds = await Requestforrefunds.json()

// Function to Get Users 
const Requestforusers = await fetch(`${process.env.NEXT_PUBLIC_PORT}/users`)
const Responseforusers = await Requestforusers.json()

const Data = {
    users:Responseforusers.data ,
    refunds: Responseforrefunds.data
}
  
  
 
  return (
    <>
      <Clientside data = {Data}  />
     
    </>
  );
}

