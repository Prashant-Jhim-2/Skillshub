'use client'
import {useState,useEffect, useRef} from 'react'
import { VscArrowCircleLeft } from "react-icons/vsc";
import Image from 'next/image';
import {db} from './firebase'
import { FilePenLine, User } from 'lucide-react';
import { DoorOpen } from 'lucide-react';
import { Search } from 'lucide-react';

import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
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

    const GetExistingChat = async() =>{
        const session = await Session 
        const id = session.user.id
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Chats/${id}`)
        const Response = await Request.json()
        if (Response.status == true){
            ChangeChats(Response.data)
        }
        
    }
    useEffect(()=>{
    var unsubscribe = ()=>{}
    
    CheckAuth()
    GetExistingChat()
    
                        
               

          
       
     


    },[])

    
    const ChatComponet = (props) =>{
        const [CardDetails,ChangeCardDetails] = useState({ImgSrc:"",FullName:"",LastSeen:"",id:""})
        const[LastSeenSec,ChangeLastSeenSec] = useState(0)
        const [Online,ChangeStatus] = useState(false)
        const data = props.data
        console.log(LastSeenSec)

       
    
        const FetchData = async() =>{
            var details  = {}
            if (Details != undefined){
              
                var id = Details.id 
                
                
                if (data.User1 != id){
                    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${data.User1}`)
                    const Response = await Request.json() 
                    const seconds = data.User1LastSeen
                   
                    ChangeLastSeenSec(seconds)

                            // Convert to Date object
                        const date = new Date(seconds * 1000);


                            const formattedDateTime = date.toLocaleString('en-US', {
                             month: 'short',   // e.g., Apr
                             day: 'numeric',   // e.g., 19
                             hour: '2-digit',
                             minute: '2-digit',
                             hour12: true,
                            });
                          const  LastSeen = formattedDateTime
                          const nowseconds = Math.floor(Date.now()/1000)
                            const diff = nowseconds - seconds
                            if (diff > 10){
                                if (Online == true){
                                    ChangeStatus(false)
                                }
                            }
                    if (Response.status == true){
                        details.ImgSrc = Response.Details.ImgSrc 
                        details.FullName = Response.Details.FullName 
                        details.id == data.User1
                        details.LastSeen = LastSeen
                    }
                    
                }
                if (data.User2 != id){
                    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${data.User2}`)
                    const Response = await Request.json() 
                    const seconds = data.User2LastSeen
                   
                    ChangeLastSeenSec(seconds)

                            // Convert to Date object
                        const date = new Date(seconds * 1000);


                            const formattedDateTime = date.toLocaleString('en-US', {
                             month: 'short',   // e.g., Apr
                             day: 'numeric',   // e.g., 19
                             hour: '2-digit',
                             minute: '2-digit',
                             hour12: true,
                            });
                          const  LastSeen = formattedDateTime

                         
                            const nowseconds = Math.floor(Date.now()/1000)
                            const diff = nowseconds - seconds
                            if (diff > 10){
                                if (Online == true){
                                    ChangeStatus(false)
                                }
                            }
                           
                    if (Response.status == true){
                        details.ImgSrc = Response.Details.ImgSrc 
                        details.FullName = Response.Details.FullName 
                        details.id == data.User2
                        details.LastSeen = LastSeen
                    }
                    
                }
                console.log(details)
                ChangeCardDetails(details)
                return details
            }
        }

        // Navigate to Chat 
        const GoToChat = () =>{
            Router.push('/chat/'+data.id)
        }
       

        useEffect(()=>{
        var userid = Details.id
        var interval = setInterval(async()=>{
            const docref = doc(db,'chats',data.id)
            const docget = await getDoc(docref)
            if (docget.exists){
                const data = docget.data() 
                if (data.User1 != userid){
                    var nowseconds = Math.floor(Date.now()/1000)
                    var beforeseconds = data.User1LastSeen 
                    var diff = nowseconds - beforeseconds 
                    if (diff > 10){
                        ChangeStatus(false)
                    }
                }
                if (data.User2 != userid){
                    var nowseconds = Math.floor(Date.now()/1000)
                    var beforeseconds = data.User2LastSeen 
                    var diff = nowseconds - beforeseconds 
                    if (diff > 10){
                        ChangeStatus(false)
                    }
                }
            }
        },5000)
        var unsubscribe 
     
      
        const Call = async() =>{
            
            
            unsubscribe = onSnapshot(doc(db,'chats',data.id),async(snapshot)=>{
                if (snapshot.exists()){
                    
                    const data = snapshot.data() 
                    const CardDetails = await FetchData()
                    if (data.User1 != userid){
                        if (data.User1LastSeen != CardDetails.LastSeen){
                            var NewDetails = CardDetails
                            const seconds = data.User1LastSeen
                            ChangeLastSeenSec(seconds)
                            const nowseconds = Math.floor(Date.now()/1000)
                            const diff = nowseconds - seconds
                            if (diff <= 10 ){
                                ChangeStatus(true)
                            }
                            if (diff > 10){
                                ChangeStatus(false)
                            }

                            // Convert to Date object
                            const date = new Date(seconds * 1000);


                            const formattedDateTime = date.toLocaleString('en-US', {
                             month: 'short',   // e.g., Apr
                             day: 'numeric',   // e.g., 19
                             hour: '2-digit',
                             minute: '2-digit',
                             hour12: true,
                            });
                            NewDetails.LastSeen = formattedDateTime
                            ChangeCardDetails(NewDetails)
                        }
                        else {
                            const seconds = data.User1LastSeen
                            ChangeLastSeenSec(seconds)
                            const nowseconds = Math.floor(Date.now()/1000)
                            const diff = nowseconds - seconds
                            if (diff > 10){
                                if (Online == true){
                                    ChangeStatus(false)
                                }
                            }
                        }

                    }
                    if (data.User2 != userid){
                        if (data.User2LastSeen != CardDetails.LastSeen){
                            var NewDetails = CardDetails
                            const seconds = data.User2LastSeen
                            const nowseconds = Math.floor(Date.now()/1000)
                            const diff = nowseconds - seconds
                            if (diff <= 10 ){
                                ChangeStatus(true)
                            }
                            if (diff > 10){
                                ChangeStatus(false)
                            }
                            // Convert to Date object
                            const date = new Date(seconds * 1000);


                            const formattedDateTime = date.toLocaleString('en-US', {
                             month: 'short',   // e.g., Apr
                             day: 'numeric',   // e.g., 19
                             hour: '2-digit',
                             minute: '2-digit',
                             hour12: true,
                            });
                            NewDetails.LastSeen = formattedDateTime
                            ChangeCardDetails(NewDetails)
                            
                        }
                        else {
                            const seconds = data.User2LastSeen
                            const nowseconds = Math.floor(Date.now()/1000)
                            const diff = nowseconds - seconds
                            if (diff > 10){
                                if (Online == true){
                                    ChangeStatus(false)
                                }
                            }
                        }
                    }
                }
            })
        }
        Call()
        

        return () => {
            unsubscribe()
            clearInterval(interval)
        }

        },[])
        return (
            <div
                            
            className="flex   border w-80 gap-2 bg-white justufy-center items-center shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
        >
           
            <div className='flex flex-col  gap-2 items-center justify-center w-full'>
            <label className='text-2xl rounded-[120px] border shadow-lg w-12 items-center justify-center flex h-12 '>👤</label>
            <h1 className="text-lg font-semibold mt-4">{CardDetails.FullName}</h1>
           {Online == false &&  <p className="text-xs  text-gray-500">Last Seen : <strong>{CardDetails.LastSeen}</strong> </p>}
           {Online == true &&  <p className=' text-green-600 font-bold'>Online</p>}
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
            <div  onClick={GoToChat} className = "flex gap-2 active:shadow-button active:rounded-lg active:border-2 active:border-black active:translate-y-2 mt-6 w-80 p-4  border shadow-lg items-center justify-center">
               
                <div className='w-full gap-2 flex flex-col items-center justify-center' >
                    <label className='text-2xl rounded-[120px] border shadow-lg w-12 items-center justify-center flex h-12 '>👤</label>
                    <h1 className='font-bold text-md'>{data.FullName} </h1>
                   
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