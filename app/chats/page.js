'use client'
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { VscArrowCircleLeft } from "react-icons/vsc";
const Page = () => {
  const Session =  getSession()
  const Router = useRouter()

  const [chats, setChats] = useState([]);
  const [user, setUser] = useState({id:''});
  
  const fetchChats = async () => {
    const session = await Session;
    console.log(session);
    if (!session) {
      Router.push('/')
    }
    else {
      const user = session.user.id 
      console.log(user);
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolled/${user}`);
      const Response = await Request.json();
      console.log(Response);
      setUser({id:user})

      if (Response.status  == true){
        const NewData = Response.data.map((item)=>{
          return {
            CourseID:item.CourseID,
            CourseName:item.CourseName,
          }
        })
        setChats(NewData);
      }
    }
  }
  useEffect(()=>{
    fetchChats();
  },[])



  const Card = (props)=>{
    const [LastMessagetext, setLastMessage] = useState(undefined);
     
    const LastMessage = async()=>{
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/LastChat/${props.CourseID}`);
      const Response = await Request.json();
      console.log(Response);
      if (Response.status == true) {
        const data = Response.data; 
        
        let messageText = data.Chat;
        if (messageText.length > 15) {
          messageText = messageText.substring(0, 15) + '...more';
        }
        const lastMessage =  {
          FullName: data.Profile != user.id ? data.FullName : 'Me',
          id: data.Profile,
          Message: messageText,
        }
        setLastMessage(lastMessage);
      } else {
        console.log("No Last Message Found");
      }
    }
    useEffect(() => {
      LastMessage()
     } , []);
    return (
       <div  className="w-80 flex shadow-lg rounded flex-col gap-4 border p-3">
                  <h1 className="text-xl font-bold">{props.CourseName}</h1>
                  <p className="text-[10px]">
                   {LastMessagetext != undefined ? <> 
                   Last Message : <strong className=" text-black border shadow-lg p-2 rounded">{LastMessagetext.FullName} : {LastMessagetext.Message}</strong></>
                     : <>No Last Message</>}
                  </p>
                  <button
                    onClick={() => {
                      Router.push(`/CourseChat/${props.CourseID}`);
                    }}
                    className="self-start active:bg-white active:text-black active:border active:border-black text-xs bg-black text-white p-2 rounded"
                  >
                    Go to Chat 💬
                  </button>
                </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-lg mt-2">TryMyBoard 📖</h1>
      <label className="text-xs bg-black text-white p-2 rounded">Community Chat</label>
      <button
      onClick={()=>{
        Router.back();
      }}
      className="fixed flex gap-1 active:text-rose-600 items-center justify-center top-2 left-2"> <VscArrowCircleLeft size = {20}/>Back</button>

      <div className="mt-24 w-80 flex flex-col items-center justify-center">
        <label>All Chats</label>

        <div className="flex flex-col mt-12 gap-6 items-center justify-center w-full">
          {chats.length > 0 ? (
            <>
              {chats.map((data) => <Card CourseID={data.CourseID} CourseName={data.CourseName}/>)}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src="/empty.gif"
                alt="No Chats"
                width={120}
                height={120}
                className="mb-2"
              />
              <label className="text-xs">No Chats Found</label>
              <label className="text-xs mb-12">Enroll in a course to start  chatting in Community Chats</label>
              <button onClick={()=>{
                Router.push('/home')
              }} className="bg-black text-white rounded p-2">Go Back To Enroll</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Page;