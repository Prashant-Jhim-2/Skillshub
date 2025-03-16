'use client'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {useState,useEffect} from 'react'
const Page = ({data}) =>{
  const [UserDetails,ChangeUserDetails] = useState({})
  const [VideoUrl,ChangeVideoUrl] = useState('')
  const [PhotoUrl,ChangePhotoUrl] = useState('')
  const Router = useRouter()
  const [Chats,ChangeChats] = useState([])
  const session = getSession()
  // Function To Check Authication 
  const CheckAuth = async() =>{
    const Session = await session 
    if (Session != undefined){
      const id = Session.user.id 
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
      const Response = await Request.json()
      if (Response.status == true){
        console.log(Response)
        ChangeUserDetails(Response.Details)
      }
      if (Response.status == false){
        Router.push("/")
      }
    }
    if (Session == undefined){
      Router.push('/')
    }
  }

  //UseEffect to CheckAuth 
  useEffect(()=>{
    CheckAuth()
  },[])


  // Function to Give Date 
  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options);
  
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions).toLowerCase();
  
    return `${formattedDate} : ${formattedTime}`;
  };

  // Send Chat 
  const Send = () =>{
    const date = new Date()
    const datestring = formatDate(date)
    const value = document.getElementById("Chat").value 
    if (value != ''){
      document.getElementById("Chat").value = ''

      const Details = {
        id :UserDetails.id ,
        FullName:UserDetails.FullName,
        Chat : value ,
        
        date:datestring
      }
      const newarr = [...Chats,Details]
      ChangeChats(newarr)
    }
    if (value == ''){
     

    }
   
    

  }
  // Chat Componet 
  const Chat = (props) =>{
    const Status = props.id == UserDetails.id 

    if (Status == true){
      return (
        <div className ='mt-6 '>
          <div className = 'w-80 flex relative flex-col shadow  border-l-2 border-l-blue-500 flex flec-col '>
            <label className = 'ml-6 text-md'>Me</label>
            <p className = 'text-xs mt-3 p-3   ml-3 whitespace-pre-line break-all w-full'>{props.Chat}</p>
            <div className = 'relative h-80 mb-6 border  w-80'>
              <Image 
              className = 'z-10'
                 src = '/Hamster.gif'
               layout = 'fill'
               objectFit = 'cover'
              />
            </div>
            <label className = 'ml-3 absolute bottom-0 right-2 text-rose-600 text-[10px]'>{props.date}</label>
          </div>
          </div>
      )
    }

    if (Status == false) {
      return (
        <div className ='mt-6'>
        <div className = 'w-80 flex flex-col shadow p-3  border-l-2 border-l-red-500 flex flex-col '>
          <label className = 'ml-6 text-md'>{props.FullName}</label>
          <p className = 'text-xs mt-3 p-3   ml-3 whitespace-pre-line break-all w-full'>{props.Chat}</p>
          <label className = 'ml-3 absolute bottom-0 right-2 text-rose-600 text-[10px]'>{props.date}</label>

        </div>
        </div>
      )
    }
  }
    return (
      <div className = 'flex  flex-col items-center justify-center'>
       
        <div className = ' flex z-30   fixed bg-white py-2 top-0 border-b w-full flex-col items-center justify-center '>
        <button className = 'absolute px-3 py-2 border border-black rounded top-2 left-2 '>
          Back
        </button>
        <h1 className = 'text-2xl  '>Skillshub📝</h1>
          <button className = 'text-xl mt-3'>{UserDetails.FullName}</button>
           <strong className = 'text-sm text-green-600'>🟢 Online</strong>
           <label>Typing...</label>
        </div>

        <div className = 'mt-48 mb-48'>

         {Chats.map((data)=><Chat id = {data.id} FullName = {data.FullName} Chat = {data.Chat} date = {data.date} />)}
        </div>
       
         

       
        <div className = 'fixed z-20 bg-white shadow-lg w-80  bottom-6 p-3 flex flex-col gap-3 border rounded items-center justify-center'>
        
          <div className = 'flex items-center justify-center'>
          <textarea id = "Chat" className = 'items-center border-b border-b-black  h-auto p-3 outline-none justify-center flex' placeholder = 'Text Anything' type = 'text' />
          <button onClick= {Send} className ='border rounded text-white bg-green-600 px-3 py-2'>Send</button>
          </div>
          <div className = 'flex self-start gap-3 ml-3'>
          <button className = 'border text-xs   px-3 py-2 rounded shadow-button'>Photo 📸</button>
          <button className = 'border px-3 py-2 shadow-button text-xs rounded'>Video 📹</button>
          <button>Delete</button>
         </div>
         <div className = 'relative border  shadow-lg w-80 h-80' id = "PreviewPhoto">
          <Image className = 'z-20' layout = 'fill' objectFit = 'contain' src = 'https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/file%2F1737910590700-145a792b-03c3-48da-8dc8-a67ddc2ed3a6.JPG?alt=media&token=c40bf8fc-563e-41d2-a04d-44db2d7754ea' />
         </div>
           </div>
      </div>
    )
}
export default Page 