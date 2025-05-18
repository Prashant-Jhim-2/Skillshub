'use client'
import {useState,useEffect} from 'react'
import { getSession } from 'next-auth/react'
import { VscArrowCircleLeft } from "react-icons/vsc";
import { useRouter } from 'next/navigation'
import {db} from './firebase'
import {motion} from 'framer-motion'
import { collection, onSnapshot, orderBy, query, where} from "firebase/firestore";
import Link from 'next/link'



import Image from 'next/image'

const Page = ({Data}) =>{
    const [UserDetails,ChangeUserDetails] = useState({id:"",FullName:""})
    const [AlertCards,ChangeAlerts] = useState([])
    const Session = getSession()
    const Router = useRouter()
    // Function to Get User Info
    const CheckAuth = async() =>{
        const session = await Session 
        if (session != undefined){
            const user = session.user.id 
           const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${user}`)
           const Response = await Request.json()
           if (Response.status == true){
            const  Details = {
                id:Response.Details.id,
                FullName:Response.Details.FullName
            }
            
            ChangeUserDetails(Details)
            // Part to Filter the Data Only For USer 
            const NewData = Data.filter((data)=>{
                if (data.User == Response.Details.id || data.User == "All"){
                   return data
                }
                
            })
            ChangeAlerts(NewData)
            return user
           }
           if (Response.status == false){
            Router.push('/')
           }
        }
        else {
            Router.push("/")
        }
    }
    // Function to Clear all Alerts 
    const ClearAlerts = async()=>{
        const id = UserDetails.id 
        const Request  = await fetch(`${process.env.NEXT_PUBLIC_PORT}/ClearAlerts/${id}`)
        const Response = await Request.json()
        if (Response.status == true){
            ChangeAlerts([])
        }
    }
    // Alert Component 
    const AlertCard = (props)=>{
        const [User,ChangeUserDetails] = useState({FullName:'',id:''})
        const data = props.data
       if (data.Type == "Chat"){

       
        
        return (
            <div className='flex flex-col w-80 relative border p-4 items-center justify-center shadow-lg'>
               <p className=' flex flex-col items-center justify-center text-center'><nav><Link className='text-red-500 underline' href = {`/profile/${data.By}`}>{data.ByFullName}</Link></nav> sent a new message</p>
               <label className=' text-blue-500 shadow-lg border p-3  rounded mt-3 mb-3'>  {data.Message} </label>
               <label className=' text-xs text-gray-400 bottom-0 right-6'>{data.time}</label>
               <motion.button 
               
               className='mt-6 active:bg-white active:border-black active:text-black border p-3 bg-black text-white rounded text-xs'><nav><Link href={data.Page}>Go to Chat</Link></nav></motion.button>
              

            </div>
        )
       }
    }
    useEffect(()=>{
     CheckAuth()
     var unsubscribe = ()=>{}
     const call = async() =>{
        const session = await Session 
        const user = session.user.id 
        const q = query(collection(db,'alerts'),where("User","==",user))
        unsubscribe = onSnapshot(q,(snapshot)=>{
            const newarr = snapshot.docs.map(doc=>({
                id:doc.id,
                ...doc.data()
            }))
            newarr.sort((a,b)=>{
                const AA = a.created.toDate()
                const BB = b.created.toDate()
                return BB - AA
            })
            ChangeAlerts(newarr)
        })
     }
     call()
     return () => unsubscribe()
    },[])

    const goback = ()=>{
        Router.push('/home')
    }
    return (
        <div className='flex flex-col items-center justify-center'>
            <h1 className='text-2xl h-12 w-full flex items-center bg-white justify-center z-30 fixed top-0 '>SkillsHub📝</h1>
           
            <button onClick = {goback} className='fixed flex gap-1 justify-center items-center z-30 top-2 left-2 active:text-rose-600'><VscArrowCircleLeft size = {30}/>Back</button>
            <h2 className=' mt-24 mb-6'>Alerts ( {AlertCards.length} )</h2>
            <button className='border fixed top-2 text-xs right-3 mb-6 bg-rose-600 z-30 active:bg-white active:border-black active:text-black text-white py-2 px-3 rounded' onClick={ClearAlerts}>Clear Alerts</button>
            {AlertCards.length != 0 && 
             <div className='flex flex-col gap-6 items-center'>
                {AlertCards.map((data)=><AlertCard data = {data} />)}
            </div>}
            {AlertCards.length == 0 &&
             <div className='flex flex-col items-center justify-center'>
                <Image src = '/empty.gif' width={150} height={150} />
                <h1 className='text-sm mb-6'>No Alerts </h1>
                <button className='border active:border-black active:bg-white active:text-black p-2 bg-black text-white rounded'><nav><Link href= '/home'>Go to Home</Link></nav></button>
            </div>}
        </div>
    )
}
export default Page 