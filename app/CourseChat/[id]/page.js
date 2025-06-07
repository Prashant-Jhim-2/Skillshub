import Clientside from './client'


export default async function Page({params}) {
const {id} = params
const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CommunityChats`)
const Response = await Request.json()

const Data = Response.Data

const NewFilter = Data.map((data)=>{
  if (data.Courseid == id ){
    return data
  }
})
 
  return (
    <>
      <Clientside data = {NewFilter}  />
     
    </>
  );
}

