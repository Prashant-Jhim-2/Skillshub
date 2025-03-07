"use client"
import  { useState ,useEffect } from "react";
import ReactPlayer from "react-player";
import { useRef } from "react";
import { TbLocationQuestion } from "react-icons/tb";
import { getSession } from 'next-auth/react';
import { useInView } from "react-intersection-observer";
import { VscArrowCircleLeft } from "react-icons/vsc";
import Image from "next/image";
import { useRouter } from "next/navigation";

const VideoPlayer = ({ url, className, controls = true, light = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the video is in view
    triggerOnce: true, // Only trigger once
  });

  return (
    <div
      ref={ref}
      className={` ${className}`}
    >
      {inView && (
        <ReactPlayer
          url={url}
          controls={controls}
          light={light}
          playing={isPlaying}
          width="100%"
          height="100%"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      {!inView && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      )}
    </div>
  ); 
};




export default function Home({Data}) {
  const Router = useRouter()
  const session = getSession();
  const commentsEndRef = useRef(null);
  const [Postbtntext,changePostbtntext] = useState("Post")
  const textareaRef = useRef(null);
  const [UserDetails,ChangeDetails] = useState({id:''})
  const [Questions,ChangeQuestions] = useState(Data.Questions)
  const handleInput = (event) => {
    const textarea = event.target;
    
    textarea.style.height = "auto"; // Reset height to calculate scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
}
 
 console.log(Questions)
  // CheckAuth To Check User is Login or not 
  const CheckAuth = async() =>{
    const Session = await session 
    console.log(Session)
    if (Session.user == undefined){
      Router.push('/')
    }
    else{

      ChangeDetails(Session.user)
    }
  }
  useEffect(()=>{
  CheckAuth()
  },[])

  // Function To Fetch The Questions 
const FetchQuestions = async() =>{
  // Part where it fetch all questions 
  const Requestforquestions = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Questions/${Data.id}`)
  const Responseforquestions = await Requestforquestions.json()
  ChangeQuestions(Responseforquestions.data)
  console.log(Responseforquestions.data)
}

 

  
  const QuestionCard = (props) =>{
    const [Editable,ChangeEditable] = useState(false)
    const [Replies,ChangeReplies] = useState([])
    const [BorderOrNot,ChangeBorderOrnot] = useState("")
    const [Text,ChangeText] = useState(props.Text)
    const [SaveOrCancel,ChangeSaveOrCancel] = useState("hidden")
    const [DeleteOrNot,ChangeDeleteOrNot] = useState("hidden")
    const [ReplyShow,ChangeReplyShow] = useState("hidden")
    const [ReplyText,ChangeReplyText] = useState(undefined)
    // To Edit The Questions 
    const EditQuestion =() =>{
      ChangeBorderOrnot("border border-black rounded-lg")
      ChangeEditable(true)
      ChangeSaveOrCancel("flex")
    }
    useEffect(()=>{
      if (props.ProfileId == UserDetails.id ){
        ChangeDeleteOrNot("flex")
      }
    })
    // Save The Changes in Text 
    const SaveChanges = (event) =>{
      const text =  event.target.textContent 
      ChangeText(text)
    }
    // Save Changes in Reply Text 
    const SaveReply = (event) =>{
      ChangeReplyText(event.target.value)
      console.log(event.target.value )
    }

    // Save The update text 
    const SaveQuestion = async() =>{
      console.log("i mafjafja")
     const text =  Text
     console.log(text)
     const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/EditQuestion`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id:props.id ,Text:text})
     })
     const Response = await Request.json()
     console.log(Response)
     if (Response.status == true){
      FetchQuestions()
     }
    }
    const ReplyorNot = async() =>{
      ChangeReplyShow("flex")
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetReplies/${props.id}`)
      const Response = await Request.json()
      if (Response.status == true){
        ChangeReplies(Response.data)
      }
    }

     // useEffect to call function first
  // Reply Card Component 
  const ReplyCard = (props)=>{
    // Function To Delete The Reply
    const DeleteReply = async() =>{
      if (props.ProfileId == UserDetails.id ){
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteReply/${props.id}`)
        const Response = await Request.json()
        if (Response.status == true){
          ReplyorNot()
        }
      }
    }
    return (
      <div className = 'w-full py-6 mb-2 border  flex'>

          <div className = 'relative w-12 ml-2 mt-2  h-12 '>
          <Image
          src = "https://unsplash.com/photos/5dahujbrfX4/download?ixid=M3wxMjA3fDB8MXxhbGx8MTZ8fHx8fHx8fDE3MzYwNDA2NDl8&force=true"
          layout="fill"
          objectFit="cover"
          className = 'rounded-full'
          />
          <button className = 'text-[8px] mt-12'>
           {props.Name}
          </button>
        </div>

        <div className = 'mb-2  w-full  relative px-3 py-2'>
        <h1 className = ' text-sm'>{props.Text} </h1>
        <button onClick={DeleteReply} className = 'text-rose-600 text-xs'>Delete</button>
      </div>

      </div>
    )
  }
    // Delete Questions
    const DeleteQuestion = async () =>{
      console.log(props.id)
      console.log("I am Working")
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteQuestion`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:props.id})
      })
      const Response = await Request.json()
      console.log(Response)
      if (Response.status == true){
        FetchQuestions()
      }
    }
    // Function to Post The Reply 
    const PostReply = async() =>{
      const Details = {
        Name : UserDetails.name ,
        ProfileId:UserDetails.id ,
        Text:ReplyText,
        QuestionId:props.id
      }
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Reply`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(Details)
      })
      const Response = await Request.json()
      console.log(Response)
      if (Response.status == true){
        document.getElementById(props.id).value = ''
        ReplyorNot()
      }
    }
    // ButtonToShow 
    const ReplyorEdit = () =>{
       if (UserDetails != undefined){
        if (props.ProfileId == UserDetails.id){
          return (
          <>
          <button onClick = {EditQuestion}>Edit</button>
          </>)
         }
         else{
          return (
            <>
            <button>Reply</button>
            </>
          )
         }
       }
    }
    return (
      <div className = 'w-80 relative rounded-lg border mb-3 shadow-lg  '>
        <div className = {`absolute z-30 ${SaveOrCancel} bottom-2 text-xs right-2 flex  gap-3`}>
          <button onClick = {SaveQuestion} className = 'bg-green-600 active:bg-black active:text-green active:border-black px-2 py-2 rounded-lg text-white'>Save✅</button>
          <button>Cancel</button>
        </div>
       <div className = 'w-full p-2  relative'>

       <h1 onInput= {SaveChanges} contentEditable = {Editable}   id = "Text" className = {`w-56 text-sm ${BorderOrNot}  p-1 mt-6 ml-[80px]  mb-3 break-words`}>{props.Text}</h1>
        <div className = 'gap-2  ml-[80px] flex text-sm'>
         <ReplyorEdit/>
          <button onClick = {DeleteQuestion} className = {`text-rose-600 ${DeleteOrNot}`}>Delete</button>
        </div>
        <button onClick ={ReplyorNot} className = 'text-xs ml-[80px] text-blue-500'>View Replies</button>

        <div className = 'absolute w-12 h-12 top-1/4 left-4'>
          <Image
          src = "https://unsplash.com/photos/5dahujbrfX4/download?ixid=M3wxMjA3fDB8MXxhbGx8MTZ8fHx8fHx8fDE3MzYwNDA2NDl8&force=true"
          layout="fill"
          objectFit="cover"
          className = 'rounded-full'
          />
          <button className = 'text-[8px] mt-12'>
            {props.Name}
          </button>
        </div>
       </div>

        <div className = {`${ReplyShow} flex items-center justify-center flex-col `}>
          <h1 className ='w-full  text-center mt-6'>Replies </h1>
          <textarea id = {props.id} onInput = {SaveReply}   ref={textareaRef}  placeholder = 'Ask a Question' className = 'mb-3 outline-none w-64 border border-black  p-2 rounded-lg shadow-lg'/>
          <button onClick = {PostReply} className = 'px-3 mb-6 py-2 bg-black text-white rounded'>Post Reply</button>
          {Replies.map((data)=><ReplyCard id = {data.id} Name = {data.Name} ProfileId={data.ProfileId} Text={data.Text} QuestionId={data.QuestionId} />)}
        </div>
        
       
      </div>
    )
  }

  // Function To Post Question 
  const PostQuestion = async() =>{
   changePostbtntext("Posting...")
   document.getElementById("PostQuestion").disabled = true
    const id = UserDetails.id
    const Name = UserDetails.FullName
    const PrevQuestions = Questions 
    const Details = {
      Text:document.getElementById("Comment").value,
      Name:Name,
      CourseId:Data.id,
      ProfileId:id,
      
    }
   
   
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/PostQuestion`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Details)
    })
    const Response = await Request.json()

    if (Response.status == true){
      const NewDetails = {
        id:Response.id ,
        ...Details
      }
      document.getElementById("Comment").value = ''
      const NewQuestions = [...PrevQuestions,NewDetails]
      ChangeQuestions(NewQuestions)
      setTimeout(()=>{
        changePostbtntext("Post")
        document.getElementById("PostQuestion").disabled = false
        // Scrollup Function
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      },100)
     
    }
   
  }


  return (
    <div className="  items-center  flex flex-col  ">      
    <button className = 'absolute top-2 left-2 px-3 py-2 bg-white active:shadow-none transition duration-200 flex gap-1 items-center justify-center active:translate-y-2  rounded-lg  text-md'> <VscArrowCircleLeft size={30} />  Back</button>
    <h1 className = 'text-2xl  mt-6'>SkillsHub📝</h1>
    
     <h1 className = 'text-xl mt-24'>{Data.Details.Name}</h1>
     <p>{Data.Details.Description}</p>
    <VideoPlayer
        url={Data.Details.urlofvideo}
        className="w-[360px] mt-6 rounded-lg overflow-hidden  h-[260px] "
        light={Data.Details.urlofThumbnail}
      />
      <h2 className = 'mt-6'>Questions</h2>
      <div>
        <div id = "Commentbox" className = 'w-80 relative flex flex-col gap-1 h-auto    mb-6 mt-6 '>
        <textarea id = "Comment"  ref={textareaRef} onInput={handleInput} placeholder = 'Ask a Question' className = 'mb-3 outline-none w-80 border border-black  p-2 rounded-lg shadow-lg'/>
        <button id = "PostQuestion" onClick={PostQuestion} className = 'w-full flex items-center justify-center gap-2 bg-black text-white px-3 py-2 '> {Postbtntext}<TbLocationQuestion size ={20} /></button>
        </div>

        <div id = 'comments'>
          {Questions.map((data)=><QuestionCard id = {data.id} Text= {data.Text} CourseId = {data.CourseId} ProfileId = {data.ProfileId} Name = {data.Name} />)}
        </div>
        <div ref={commentsEndRef} >
      </div>

      </div>
    </div>
  );
}
