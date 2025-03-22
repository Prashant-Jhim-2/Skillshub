'use client'
import {useState,useEffect} from 'react'
import { VscArrowCircleLeft } from "react-icons/vsc";
import Footer from '@/app/footer'
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const Page = ({data}) =>{
    const [Users,ChangeUsers] = useState(data)
    const Router = useRouter()
    const Session = getSession()
    // Check User Auth 
    const CheckAuth = async() =>{
        const session = await Session 
        if (session != undefined){
            const id = session.user.id 
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
            const Response = await Request.json() 
            console.log(Response)
            if (Response.status == true){
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
     CheckAuth()
    },[])
    // Function to Navigate to Chat page 
    const GoToChat = async(event) =>{
        const idofuser2 = event.target.id 
        const idofuser1 = await CheckAuth()
        const Details = {
            User1:idofuser1,
            User2:idofuser2
        }
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
    
    // Function to Go Back to home page 
    const GoBack = () =>{
        Router.push('/home')
    }
    return (
        <div className = 'flex flex-col items-center justify-center'>
            <button onClick = {GoBack} className = 'fixed active:text-rose-600 top-2 left-2 flex items-center justify-center gap-1'> <VscArrowCircleLeft size = {30} />Back</button>
            <h1 className = 'text-2xl mt-12 '>Skillshub📝</h1>
            <div className = 'mt-24 flex flex-col items-center justify-center'>
                <input className = 'w-64 text-xl border-b-2 text-center h-12 border-b-black' type = 'text' placeholder = 'Enter The Username ' />
                <h2 className ='text-sm mt-12'>Click on User Button to start Chat 💬</h2>
                {Users.map((data)=><button onClick={GoToChat} className = 'border text-sm w-80 border-black h-12 px-3 rounded  shadow-button mt-6' id = {data.id}>{data.FullName} 👨🏻‍💻</button>)}
            </div>
            <Footer/>
        </div>
    )
}
export default Page