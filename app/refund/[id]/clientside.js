'use client'
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useEffect} from 'react'
import { getSession } from 'next-auth/react';
import {useRouter} from 'next/navigation'

const Page = ({data}) =>{
    const Router  = useRouter()
    const Session = getSession();
    const CheckAuth = async()=>{
        const session = await Session
        if (data.ProfileID != session.user.id ){
            Router.push("/")
        }
    }
    useEffect(()=>{
        CheckAuth()
    })

    // Function to Go Back to Profile Page 
    const GoBack = async() =>{
        const session = await Session 
        Router.push("/profile/"+session.user.id)
    }
    const SendRequest = async()=>{
        const session = await Session 
        const Details = {
            ProfileID:session.user.id,
            PaymentID:data.PaymentID,
            Reason :  document.getElementById("Reason").value ,
            Approved:"Pending"
        }
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Refund`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(Details)
        })
        const Response = await Request.json()
        if (Response.status == true){
            Router.push('/profile/'+session.user.id)
        }
        
    }

    return (
        <div className = "flex flex-col items-center justify-center">
            <h1 className = 'mt-6 text-3xl'>
            Skillshub 📝
            </h1>
            <button onClick={GoBack} className = 'fixed top-2  flex items-center justify-center left-2'><VscArrowCircleLeft size={30} />Back</button>
            <h2 className = 'mt-24 font-bold text-xl'>Refund Application</h2>
            <div className = 'rounded border-black px-3 py-2'>
                <h1>Course Name : {data.CourseName}</h1>
                <h1>CourseID : {data.CourseID}</h1>
                <h1>Amount Paid : ${data.Amount}</h1>
                <h1>Payment Date : ${data.DateofPurchase}</h1>
                <h1>Payee Email : {data.Email}</h1>
                <h1>Payee Name  : {data.Name}</h1>

            </div>
            <label className = 'mt-12'>Reason</label>
            <textarea id = "Reason" className = 'border h-64 rounded-lg border-black p-2 w-80' placeholder = "Reason for Refund" />
            <button onClick={SendRequest} className = 'bg-black text-white border  px-3 py-2 rounded-lg  shadow-lg mt-6'>Send Request 📤</button>
        </div>
    )
}
export default  Page 