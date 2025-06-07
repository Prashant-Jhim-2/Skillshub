'use client'
import { getSession } from 'next-auth/react';
import {useState,useEffect} from 'react'
import { MdDeleteOutline } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { VscArrowCircleLeft } from "react-icons/vsc";
import { useParams, useRouter } from 'next/navigation';
const Page = ({ data }) => {
    const parmas = useParams()
    const [Chats,ChangeChats] = useState(data)
    const [Length , ChangeLength] = useState(0)
    const Session = getSession()
    const Router = useRouter()
    const [Details,ChangeDetails] = useState({})


    const CheckAuth = async()=>{
        const session = await Session;
        if (!session) {
            Router.push('/')
        }
        else {
            const user = session.user.id 
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${user}`)
            const Response = await Request.json()
            if (Response.status == false) {
                Router.push('/')
            }
            else {
                ChangeDetails(Response.Details)
                
            }
        }
    }

    useEffect(()=>{
        CheckAuth()
    },[])
    const PostChat = async() =>{
        const session = await Session 
        const user = session.user.id 
        const FullName = session.user.FullName 
        const id = parmas.id
        const NewChat = {
            Courseid:id,
            Chat:document.getElementById("Chat").value,
            Profile: user,
            FullName,
            MarkedImp:[],
        }
        
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SendCommunityChat`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({details:NewChat})
        })
        const Response = await Request.json()
        if (Response.status == true){
            const NewChats = {
                ...NewChat,
                id:Response.id
            }
            const newdata = [...Chats,NewChats]
            ChangeChats(newdata);
        }

        
    }

    const Chat = (props) =>{
        const Profile = props.Profile 
        const user = Details.id
        return (
            <div className=" self-start pt-6   flex flex-col  " >
                 <p className="text-[13px] font-bold">{Profile == user ? <>Me</> : <>{props.FullName}</>}</p>
                <h1 className={`text-sm border-l-4 pl-2 ${Profile == user ? 'border-l-blue-600' : 'border-l-red-600'}`}>{props.Chat}</h1>
                {Profile == user ? <>
                 <button className=' flex gap-2 items-center justify-center text-xs self-start mt-3'> <CiBookmark className={`${props.MarkedImp.length !=0 ? "text-black font-bold":'bg-white text-black'}`} size={20} />  {props.MarkedImp.length == 0 ? <>Mark as Important</>  : `Marked Important [${props.MarkedImp.length}]` } </button>
                <button className = 'flex self-start gap-2 mt-3 active:text-rose-600 text-sm items-center justify-center'><MdDeleteOutline className='text-rose-600' size = {20} />Delete for Everyone </button>
             
                </>:<></>}  
            </div>
        )
    }
    return (
       <div className="flex  flex-col w-screen h-screen ">
      



         <div className = 'w-full hidden  h-screen flex items-center justify-center bg-white/30 backdrop-blur fixed z-40'>



          <div className='w-80 bg-white overflow-auto relative border flex items-center justify-center flex-col gap-2 p-4 rounded-lg shadow-lg'>
            <button className='text-sm absolute top-2 p-2  bg-black text-white rounded left-2'>Back</button>
            <label className='border-b-2 mb-6 border-b-black'>Enrolled Students</label>
           <div className='w-full flex flex-col gap-2 pb-6   h-80 overflow-scroll'>
            <button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button><button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button><button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button><button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button>
            <button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button><button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button><button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>Prashant Jhim  <strong className='text-sm text-green-500'>Active</strong></button>
           
            
            
           </div>
             </div>
         </div>
         <button className="fixed flex gap-1 items-center justify-center bg-white top-2 left-3"><VscArrowCircleLeft size = {25}/>Back</button>
        <div className="flex flex-col mt-6 h-24  items-center justify-center w-screen  "> 
             <label >Educorner 📖</label>
             <h1 className="text-xs p-2 bg-black text-white rounded font-bold">Ilets Class Chats</h1>
             
             <label className='text-white fixed top-0 right-2 p-2 font-bold rounded-lg mt-3 bg-green-600 text-sm'>23  Active</label>
        </div>
        <div className = 'w-screen pt-6 h-3/4 pl-2 flex flex-col  '>
           

            <div className="flex flex-col gap-6 h-full    overflow-scroll items-center  mt-4">
               {Chats.map((data)=><Chat MarkedImp = {data.MarkedImp} Profile={data.Profile} user = {data.user} FullName = {data.FullName} Chat = {data.Chat}/>)}
               <label id = "End" className='text-[2px]'>End Of Chat</label>
            </div>
        </div>

       <div className="flex flex-col h-screen w-screen px-4 py-2 bg-white">
 
  <div className="flex justify-end mb-1">
    <label className="font-bold text-xs text-black">{Length} Words</label>
  </div>

  <div className="relative flex items-center overflow-auto   justify-center flex-col w-full   ">
    <textarea
      onChange={(e)=>{
        const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
        ChangeLength(words);
      }}
      id = "Chat"
      className="w-full h-36 text-sm p-3 pr-16 border-2 rounded-lg border-black shadow-lg outline-none"
      placeholder="Type your message here..."
    ></textarea>

   
    <button
    onClick={PostChat}
    className="self-end mt-3 bg-black text-white text-sm p-3 rounded shadow">
      Send
    </button>
  </div>
</div>

       
        
        </div>
    );
};
export default Page;