'use client'
import {useState,useEffect, useRef} from 'react'
import { VscArrowCircleLeft } from "react-icons/vsc";
import Image from 'next/image';
import {db} from './firebase'
import { FilePenLine, User } from 'lucide-react';
import { DoorOpen } from 'lucide-react';
import { Search } from 'lucide-react';

import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const Page = ({data}) =>{
    const [Details,ChangeDetails] = useState({})
     const [Users,ChangeUsers] = useState(data)
    const [Chats,ChangeChats] = useState([])
    const [Display,ChangeDisplay] = useState("Existing")
    const Router = useRouter()
    const Session = getSession()
    // Check User Auth 
    console.log(Chats.length != 0 || Display ==  "Existing")
    const CheckAuth = async() =>{
        const session = await Session 
        if (session != undefined){
            const id = session.user.id 
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
            const Response = await Request.json() 
            console.log(Response)
            if (Response.status == true){
              ChangeDetails(Response.Details)
               const newarr =  data.filter((data)=>{
                if (data.id != id ){
                    return data
                }
               })
               ChangeUsers(newarr)
               return id

               
               
            }
            if (Response.status == false){
                Router.push("/")
            }
        }
        if (session == undefined){
            Router.push('/')
        }

    }

    
    useEffect(()=>{
    var unsubscribe = ()=>{}
    
    CheckAuth()
    const Call = async() =>{
        var docs = []
        const session = await Session 
        const user = session.user.id 
        unsubscribe = onSnapshot(collection(db,'chats'),(snapshot)=>{
           docs = snapshot.docs.map((doc)=>{
                const details = {id:doc.id,...doc.data()}
               
                const user1 = details.User1 
                const user2 = details.User2 

                if (user1 === user || user2 === user) {
                    if (user1 != user){
                        const newdetails = {
                            User1 : details.User1,
                            User2 : details.User2,
                            User1LastSeen : details.User1LastSeen
                        }
                        return newdetails
                    }
                    if (user2 != user){
                        const newdetails = {
                            User1 : details.User1,
                            User2 : details.User2,
                            User2LastSeen : details.User2LastSeen
                        }
                        return newdetails
                    }
                  }

          
                  return null;
                
            }
            
                
            ).filter(Boolean)
            const prev = Chats 
            const issame = JSON.stringify(prev) === JSON.stringify(docs)
            if (issame != true){
                ChangeChats(docs)
            }
        })
      
       
        


    }
    Call()
    return ()=>unsubscribe()
     


    },[])

    const ChatComponet = (props) =>{
        const [CardDetails,ChangeCardDetails] = useState({ImgSrc:"",FullName:"",LastSeen:"",id:""})
        const data = props.data
        const FetchData = async() =>{
            var details  = {}
            if (Details != undefined){
              
                var id = Details.id 
                console.log(data)
                
                if (data.User1 != id){
                    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${data.User1}`)
                    const Response = await Request.json() 
                    
                    if (Response.status == true){
                        details.ImgSrc = Response.Details.ImgSrc 
                        details.FullName = Response.Details.FullName 
                        details.id == data.User1
                        details.LastSeen = data.User1LastSeen
                    }
                    
                }
                if (data.User2 != id){
                    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${data.User2}`)
                    const Response = await Request.json() 
                   
                    if (Response.status == true){
                        details.ImgSrc = Response.Details.ImgSrc 
                        details.FullName = Response.Details.FullName 
                        details.id == data.User2
                        details.LastSeen = data.User2LastSeen
                    }
                    
                }
                console.log(details)
                ChangeCardDetails(details)
            }
        }

        // Navigate to Chat 
        const GoToChat = () =>{
            Router.push('/chat/'+data.id)
        }

        useEffect(()=>{
        FetchData()
        },[])
        return (
            <div
                            
            className="flex   border w-80 gap-2 bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
        >
            <Image
                className="object-cover"
                src={CardDetails.ImgSrc}
                width={100}
                height={100}
                alt={`${CardDetails.FullName}'s profile picture`}
            />
            <div className='flex flex-col '>
            <h1 className="text-lg font-semibold mt-4">{CardDetails.FullName}</h1>
            <p className="text-xs  text-gray-500">Last Seen : <strong>{CardDetails.LastSeen}</strong> --------</p>
            <p className=' text-green-600 font-bold'>Online</p>
            <button className='w-24 flex  items-center justify-center gap-1 active:bg-white shadow-lg active:border-black active:text-black text-xs h-12 border bg-black text-white rounded mt-3' onClick = {GoToChat}>Open Chat <DoorOpen  className='w-4'/></button>
            </div>
        </div>
        )
    }
    
    // Function to Toggle Btw Existing Chat or Users 
    const Toggle = () =>{
        if (Display == "Existing"){
            console.log("Change to Users")
            ChangeDisplay("Users")
            return 0
        }
        if (Display == "Users"){
            console.log("Change to Existing")
            ChangeDisplay("Existing")
            return 0 
        }
    }
    console.log(Display)
    
    // User Card 
    const UserCard = (props) =>{
        const data = props.data 
       // Function to Navigate to Chat page 
    const GoToChat = async() =>{
        const idofuser2 = data.id
        const idofuser1 = await CheckAuth()
        const Details = {
            User1:idofuser1,
            User2:idofuser2
        }
        console.log(Details)
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckChatID`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({details:Details})
        })
        const Response = await Request.json()
        if (Response.status == true ){
            Router.push('/chat/'+Response.id)
        }
    }
        return (
            <div  onClick={GoToChat} className = "flex gap-2 active:shadow-button active:rounded-lg active:border-2 active:border-black active:translate-y-2 mt-6 w-80 p-4  border shadow-lg items-center justify-start">
               <div className='relative border shadow-lg border-gray-300 overflow-none p-6 w-12 h-12 rounded-[100px] '>
               <Image alt="ProfilePhoto" className='rounded-[100px]' objectFit='contain'  layout = 'fill' src = {data.ImgSrc} />

               </div>
                <div>
                    <h1 className='font-bold text-md'>{data.FullName}</h1>
                   
                </div>
            </div>
        )
    }

    // Search Function 
    const SearchFunction = () =>{
        const value = document.getElementById("Search").value 
        if (value == ''){
            ChangeUsers(data)
        }
        if (value != ''){
            const results = Users.filter(user=>user.FullName.toLowerCase().includes(value.toLowerCase()))
            ChangeUsers(results)
        }
    }
    // Function to Go Back to home page 
    const GoBack = () =>{
        Router.push('/home')
    }


    return (
        <div className="flex flex-col  relative items-center justify-center">
            <button onClick={GoBack} className="fixed active:text-rose-600 top-2 left-2 flex items-center justify-center gap-1">
                <VscArrowCircleLeft size={30} />Back
            </button>
            <h1 className="text-2xl mt-12">Skillshub📝</h1>
            <label className='text-xs'>Chats</label>
           
            <div className="mt-24 flex flex-col items-center justify-center w-full">
                
                <h2 className="text-xl ">Hi <strong>{Details.FullName}👋🏻</strong></h2>
                <button onClick = {Toggle} className='mt-12 fixed top-0 right-6 flex gap-2 border text-xs items-center justify-center border-black  px-3 py-2 shadow-lg rounded-lg  active:bg-black active:text-white'> <FilePenLine className='w-4' /> </button>
                {(Chats.length == 0 || Display == "Users" )&& 
                <div>
                 <div className="mb-6 mt-12 border  items-center justify-center h-16 shadow-lg text-lg rounded-lg w-80 flex gap-3 text-xl">
        <Search />
          <input
            id = "Search"
            onChange={SearchFunction}
            type="text"
            placeholder="Search User"
            className=" h-full outline-none"
          />
          
        </div>
        <div className = 'flex flex-col items-center justify-center'>
            <label>Click To Start Chat </label>
            {Users.map((data)=><UserCard data = {data}/>)}
          </div>
        
        </div>}

                {(Chats.length != 0  && Display == "Existing" )&&
                <div className='flex items-center justify-center flex-col'>
                <label className='mt-12 text-xl'>Existing Chats <strong>[{Chats.length} ]</strong></label>
                <div className="flex flex-wrap items-center justify-center mt-12 gap-4 ">
                {Chats.map((data) => (
                       <ChatComponet data = {data} />
                    ))}
                </div></div>}
            </div>
        </div>
    );
}
export default Page