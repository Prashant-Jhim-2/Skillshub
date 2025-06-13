'use client'
import { getSession } from 'next-auth/react';
import {useState,useEffect} from 'react'
import { MdDeleteOutline } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { RiFileMarkedFill } from "react-icons/ri";

import { VscArrowCircleLeft } from "react-icons/vsc";
import { useParams, useRouter } from 'next/navigation';
import { collection,  where,query, orderBy, onSnapshot } from 'firebase/firestore';
import {db} from './firebase'
import { Move } from 'lucide-react';

const Page = ({ data ,CourseData,Enrolled}) => {
    const parmas = useParams()
    const [MovedUp,ChangeMovedUp] = useState(false)
    const [EnrolledDisplay,ChangeEnrolledDisplay] = useState(false)
    const [Chats,ChangeChats] = useState([])
    const [Length , ChangeLength] = useState(0)
    const Session = getSession()
    const Router = useRouter()
    const [Details,ChangeDetails] = useState({})
   console.log(CourseData)

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

        if (MovedUp == false){
          ChangeChats(data)
          if (data.length > 3 ){
             setTimeout(() => {
            document.getElementById("End").scrollIntoView({ behavior: 'smooth' });
          }, 1000);
          }
            ChangeMovedUp(true)
        }
        const q = query(
          collection(db, "communitychats"),
          where("Courseid", "==", parmas.id)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          let chats = [];
          querySnapshot.forEach((docSnap) => {
            chats.push({ ...docSnap.data(), id: docSnap.id });
          });
          // Sort chats by createdAt in ascending order
          chats.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          ChangeChats(chats);
          if (chats.length > 3 ){
            setTimeout(() => {
            document.getElementById("End").scrollIntoView({ behavior: 'smooth' });
          }, 1000);
          }
        }, (error) => {
          console.error('Error listening to communitychats:', error);
        });
        // Cleanup listener on unmount
        return () => unsubscribe();
    
    
    },[])


    const PostChat = async() =>{
        document.getElementById("Sendbtn").disabled = true
        document.getElementById("Sendbtn").style.cursor = "not-allowed"
        document.getElementById("Sendbtn").style.opacity = "0.5"
        document.getElementById("Sendbtn").innerText = "Sending..."
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
            createdAt: Date.now()
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
              document.getElementById("Chat").value = ''
              ChangeChats(newdata)
              ChangeLength(0)
              document.getElementById("End").scrollIntoView({ behavior: 'smooth' });

              setTimeout(() => {
                document.getElementById("Sendbtn").disabled = false
                document.getElementById("Sendbtn").innerText = "Send"
                document.getElementById("Sendbtn").style.cursor = "pointer"
                document.getElementById("Sendbtn").style.opacity = "1"
              }
              , 1000)
         
           
          
        }

        
    }

    const Chat = (props) =>{
        
        const Profile = props.Profile 
        const user = Details.id
       const [MarkedImp, ChangeMarkedImp] = useState(props.MarkedImp)

        const FirstChat = props.MarkedImp.length == 0 ? {FullName:'noone'} : props.MarkedImp[0]

        const isUserInArray = (arr, userId) => {
          return arr.some(obj => obj.id === userId);
        };

        const MarkedOrNot = isUserInArray(MarkedImp, user) 


    // Function to Mark it Important 
    const MarkImportant = async(id) =>{
      const session = await Session 
      const user = session.user.id 
      const Courseid = id
      const FullName = session.user.FullName 
      const Details = {
        FullName,
        id:user,
        Courseid,
      }
      console.log(Details)

      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/MarkImportant`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({details:Details})
      })
      const Response = await Request.json()
      console.log(Response)
    }

    // Function to Mark it Important 
    const UnMarkImportant = async(id) =>{
      const session = await Session 
      const user = session.user.id 
      const Courseid = id
      const FullName = session.user.FullName 
      const Details = {
        FullName,
        id:user,
        Courseid,
      }
      console.log(Details)

      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/UnmarkImportant`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({details:Details})
      })
      const Response = await Request.json()
      console.log(Response)
    }

    // Function to delete the chat for everyone
    const DeleteChat = async(id) =>{
      const session = await Session 
      const user = session.user.id 
      const Chatid = id 

      const Details = {
        id:user,
        Chatid,
      }
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteCommunityChat`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({details:Details})
      })
      const Response = await Request.json()
      if (Response.status == false){
        alert("Something went wrong")}
    }
        return (
            <div className=" self-start pt-6   flex flex-col  " >
                 <p className="text-[13px] font-bold">{Profile == user ? <>Me</> : <>{props.FullName}</>}</p>
                <h1 className={`text-sm border-l-4 pl-2 ${Profile == user ? 'border-l-blue-600' : 'border-l-red-600'}`}>{props.Chat}</h1>
                

                {MarkedOrNot == true ? <>
                <button onClick={
                  ()=>{
                    UnMarkImportant(props.id)
                    
                  }
                } className='flex mt-3 self-start gap-2 text-sm items-center justify-center'>< RiFileMarkedFill size = {20} /> Unmark it </button>
                </> : <><button onClick = {()=>{
                  MarkImportant(props.id)
                  
                }} className = 'flex items-center justify-center text-sm  gap-2 self-start mt-3'><CiBookmark size = {20} />Mark as Important</button></>}
                
                {Profile == user ? <>
                <button onClick={()=>{
                  DeleteChat(props.id)
                }} className = 'flex self-start gap-2 mt-3 active:text-rose-600 text-sm items-center justify-center'><MdDeleteOutline className='text-rose-600' size = {20} />Delete for Everyone </button>
              </>:<></>}  




                {props.MarkedImp.length != 0 && <>
                  <label className = 'flex mt-3 border p-1 rounded border-rose-600 bg-rose-600  text-white font-bold text-xs items-center justify-center gap-2 '>

                    {props.MarkedImp.length == 1 ? <>
                    {FirstChat.id != Details.id ? <>{FirstChat.FullName}</> :<>You</>} Marked It Important
                    </>
                    :<>
                    {(FirstChat.id == Details.id || MarkedOrNot)? <>
                    You
                    </> :
                    <>{FirstChat.FullName}</>
                    } and {props.MarkedImp.length - 1} other Marked It Important
                    </>}
                  </label>
                </>}
            </div>
        )
    }
    return (
       <div className="flex  flex-col w-screen h-screen ">
      



        {EnrolledDisplay && <>
         <div className = 'w-full   h-screen flex items-center justify-center bg-white/30 backdrop-blur fixed z-40'>



          <div className='w-80 bg-white overflow-auto relative border flex items-center justify-center flex-col gap-2 p-4 rounded-lg shadow-lg'>
            <button
            onClick={()=>{
              ChangeEnrolledDisplay(false)
            }}
            className='text-sm absolute top-2 p-2  bg-black text-white rounded left-2'>Back</button>
            <label className='border-b-2 mb-6 border-b-black'>Enrolled Students</label>
           <div className='w-full flex flex-col gap-2 pb-6   h-80 overflow-scroll'>
            {Enrolled.map((data)=>{
              return (
                <button className='gap-2 h-16  p-3 rounded border-black border w-full   flex items-center justify-center'>{data.id == Details.id ? <>Me</> : <>{data.FullName}</>}  <strong className='text-sm text-green-500'>Active</strong></button>
              )
            })}
            
            
           
            
            
           </div>
             </div>
         </div>
        </>}
         <button
         onClick={()=>{
          Router.push(`/Course/${parmas.id}`)
         }}
         className="fixed z-20 active:text-rose-600 flex gap-1 items-center justify-center bg-white top-2 left-3"><VscArrowCircleLeft size = {25}/>Back</button>
  <div className="fixed top-0 left-0 w-full flex flex-col items-center justify-center  z-10 bg-white rounded-b shadow py-2">
  <label className="text-lg font-semibold">Educorner 📖</label>
  <h1 className="text-xs p-2 bg-black text-white rounded font-bold mt-1">{CourseData.Name} Chats</h1>
  
  <label onClick = {()=>{
    ChangeEnrolledDisplay(true)
  }} className="mt-2 p-1 px-3 font-bold rounded-lg bg-green-600 text-white text-sm">
    {Enrolled.length} Enrolled
  </label>
</div>



        <div className = 'w-screen pt-24 h-3/4 pl-2 flex flex-col  '>
           

            <div className="flex flex-col gap-6 h-full    overflow-scroll items-center  mt-4">
               {Chats.map((data)=><Chat id = {data.id} MarkedImp = {data.MarkedImp} Profile={data.Profile} user = {data.user} FullName = {data.FullName} Chat = {data.Chat}/>)}
               <label id = "End" className='text-[2px]'>End Of Chat</label>
            </div>
        </div>

       <div className="flex flex-col h-screen w-screen px-4 py-2 bg-white">
 
 

  <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 py-2 bg-white border-t shadow  ">
  
    <textarea
      onChange={(e)=>{
        const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
        ChangeLength(words);
      }}
      id = "Chat"
      className="w-full h-36 text-base p-3  border-2 rounded-lg border-black shadow-lg outline-none"
      placeholder="Type your message here..."
    ></textarea>

   
    <button
    id = "Sendbtn"
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