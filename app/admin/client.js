'use client'
import UserCard from './user'
import RefundCard from './refunds'
import {useEffect,useState} from 'react'
import Footer from "@/app/footer"
import { useArrStore,useRefundStore } from '@/app/store/useStore'
import { VscArrowCircleLeft } from "react-icons/vsc";
import { CiFilter } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import Image from 'next/image'


import { useRouter } from 'next/navigation'
const Page = ({data})=>{
    const Router = useRouter()
    const {Users,ChangeUsers} = useArrStore()
    const {Refunds,ChangeRefunds} = useRefundStore()
    const [Count,ChangeCount] = useState(0)
    const [View,ChangeView] = useState("Applications")
    const [display,changedisplay] = useState('hidden')
    useEffect(()=>{
        ChangeUsers(data.users)
        ChangeRefunds(data.refunds)
    },[])

    const approved = data.users.filter((data)=>{
        if (data.Approved == true){
            return data 
        }
       })
    const pending = data.users.filter((data)=>{
        if (data.Approved == false){
            return data 
        }
       })

    // Function To Show Number
    const HandleChange = () =>{
        const check1 = document.getElementById("Approved").checked 
        const check2 = document.getElementById("Pending").checked 
        if (check1){
            ChangeCount(approved.length)
        }
        if (check2){
            ChangeCount(pending.length)
        }
        if (check1 && check2){
            ChangeCount(data.users.length)
        }

    }
    // Change Arr acc to filter 
    const filtered = () =>{
        const check1 = document.getElementById("Approved").checked 
        const check2 = document.getElementById("Pending").checked 
        if (check1){
            ChangeUsers(approved)
        }
        if (check2){
            ChangeUsers(pending)
        }
        if (check1 && check2){
            ChangeUsers(data.users)
        }
        
    }
    // Function to Show Filter Div
    const Filter = () =>{
       if (display == 'hidden'){
        changedisplay("flex")
        return 0 
       }
       if (display == 'flex'){
        changedisplay("hidden")
        return 0
       }

    }
    //Function to Toggle btw applications and refunds 
    const Toggle = () =>{
        if (View == "Applications"){
            ChangeView("Refunds")
            document.getElementById("Applications").style.backgroundColor = 'white'
            document.getElementById("Applications").style.color = 'black'
            document.getElementById("Refunds").style.backgroundColor = 'black'
            document.getElementById("Refunds").style.color = 'white'
            return 0
        }
        if (View == "Refunds"){
            ChangeView("Applications")
            document.getElementById("Applications").style.backgroundColor = 'black'
            document.getElementById("Applications").style.color = 'white'
            document.getElementById("Refunds").style.backgroundColor = 'white'
            document.getElementById("Refunds").style.color = 'black'

            return 0
        }
    }

    // Function To Goback to Login Page
    const GoBack = ()=>{
        Router.push("/")
    }
    return (
        <div className = ' relative flex flex-col items-center justify-center'>
        <h1 className = 'text-2xl mt-6'>Skillshub📝</h1>
        <button onClick={GoBack} className = 'flex  items-center justify-center active:text-rose-600 gap fixed top-2 left-2'><VscArrowCircleLeft size = {30}/>Back</button>
        <h2 className ='text-sm'>Admin Page 👨🏻‍💻</h2>

        <div className = ' mt-14 flex gap-2'>
            <button onClick = {Toggle} id = "Applications" className = 'active:bg-black text-white bg-black px-3 py-2 rounded-lg active:text-white'>Applications</button>
            <button onClick = {Toggle}  id = "Refunds" className = 'px-3 py-2 rounded-lg active:bg-black active:text-white'>Refunds</button>
        </div>
        <div className = 'flex  w-80 rounded shadow-lg border-black flex-col text-sm mt-6 gap-2'>
            <button onClick = {Filter} className = 'flex active:bg-black active:text-white items-center border border-black rounded px-3 py-2 shadow-lg justify-center gap-1'>Filter <CiFilter  size={20}/></button>
             <div id = 'filterdiv' className = {`${display} py-2 px-2 flex-col`}>
             <div className = 'flex h-12 items-center justify-center gap-2'>
                <input onChange={HandleChange} id = "Approved" className = 'w-6 h-6  border-2 border-gray-500 rounded-md checked:text-white checked:bg-blue-500 checked:border-transparent focus:ring-2 focus:ring-blue-300' type = 'checkbox'/>
            <label>Approved</label>    
            </div> 
            <div className = 'flex h-12 items-center justify-center gap-2'>
                <input onChange={HandleChange} id= "Pending" className = 'w-6 h-6  border-2 border-gray-500 rounded-md checked:bg-blue-500 checked:border-transparent focus:ring-2 focus:ring-blue-300' type = 'checkbox'/>
            <label>Pending</label>    
            </div>   
            <button onClick = {filtered} className = 'w-full  flex gap-1 items-center justify-center bg-green-600 px-3 py-2  text-white'>Search <CiSearch size={20}/> <strong className ='text-xs'>( {Count} )</strong> </button>    
            </div>   
        </div>
        <div className = 'flex gap-6 mb-24 items-center justify-center mt-6 flex-wrap'>
            {(Users.length != 0 && View == "Applications")  && Users.map((Data)=><UserCard Approved = {Data.Approved} Work= {Data.Work} Certifications={Data.Certifications} Educationdetails = {Data.Educationdetails} id = {Data.id} idofuser = {Data.idofuser} ImgSrc ={Data.ImgSrc} Type ={Data.Type} FullName = {Data.FullName} Email={Data.Email} />)}
            {(Refunds.length != 0 && View == "Refunds") && Refunds.map((Data)=><RefundCard Approved = {Data.Approved} id = {Data.id} PaymentID = {Data.PaymentID} ProfileID={Data.ProfileID} Reason = {Data.Reason} />)}
            {(Users.length == 0 && View == "Applications") && 
            <div className = 'flex mt-12 flex-col justify-center items-center '>
                <Image 
                src = '/Hamster.gif'
                width={400}
                height={400}
                className = 'shadow-lg'
                />
                <label className = 'mt-6'>No Results 🔍</label>
                </div>}

                {(Refunds.length == 0 && View == "Refunds") && 
            <div className = 'flex mt-12 flex-col justify-center items-center '>
                <Image 
                src = '/Hamster.gif'
                width={400}
                height={400}
                className = 'shadow-lg'
                />
                <label className = 'mt-6'>No Results 🔍</label>
                </div>}
                
        </div>
        <Footer/>
        </div>
    )
}
export default Page 