'use client'
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useEffect,useState} from 'react'
import { getSession } from 'next-auth/react';
import {useRouter} from 'next/navigation'
import Image from "next/image";

import { FilePenLine } from 'lucide-react';

const Page = ({data}) =>{
    const Router  = useRouter()
    const Session = getSession();
    const [Exist,setExist] = useState(false)
    const [ExistingRefund,SetExistingRefund] = useState({id:"",PaymentID:"",ProfileID:"",Reason:"",Approved:""})
    const [EditableOrNot,ChangeEditable] = useState(false)
    const [EditRequestStatus,ChangeEditStatus] = useState("Nothing")
    // Function Check User Already has Refund Request
    const CheckExist = async(UserID,PaymentID)=>{
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/RefundExist`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({UserID,PaymentID})
        })
        const Response = await Request.json() 
        if (Response.status == true){
            setExist(true)
            SetExistingRefund({
                id:Response.data.id,
                PaymentID:Response.data.PaymentID,
                ProfileID:Response.data.ProfileID,
                Reason:Response.data.Reason,
                Approved:Response.data.Approved
            })
        }
        if ( Response.status == false){
            setExist(false)
        }
    }
    // Function to Delete The Refund Request 
    const DeleteRequest = async()=>{
        ChangeEditStatus("Deleting")
        const session = await Session
        const user = session.user.id
        console.log("Delete Request")
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/RefundDelete`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id:ExistingRefund.id,user})
        })
        const Response = await Request.json()
        if (Response.status == true){
            setTimeout(()=>{
                SetExistingRefund({id:"",PaymentID:"",ProfileID:"",Reason:"",Approved:""})
                    setExist(false)
            },2000)
        }
        if (Response.status == false){
            ChangeEditStatus("Failed")
        }
        setTimeout(()=>{
            ChangeEditStatus("Nothing")
        },3000)
    }
    // Function To Edit The Refund Request 
    const EditRequest = async()=>{
        console.log("Edit Request")
        const id = ExistingRefund.id 
        const session = await Session 
        const user = session.user.id 
        const Reason = document.getElementById("ReasonEdit").innerText
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/RefundEdit`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id,user,Reason})
        })
        const Response = await Request.json()
        console.log(Response)
        if (Response.status == true){
           ChangeEditStatus("Success")
           EditMode()
        }
        if (Response.status == false){
            ChangeEditStatus("Failed")
        }
        setTimeout(()=>{
            ChangeEditStatus("Nothing")
        },3000)
    }

    // Function to Turn on Edit Mode 
    const EditMode = async()=>{
        if (EditableOrNot == false){
            ChangeEditable(true)
            document.getElementById("ReasonEdit").style.border = "2px solid black"
            return 0
        }
        if (EditableOrNot == true){
            ChangeEditable(false)
             document.getElementById("ReasonEdit").style.border = "0.5px solid black"
           return 0
        }

        }

    const CheckAuth = async()=>{
        const session = await Session
        if (data.ProfileID != session.user.id ){
            Router.push("/")
        }
        if (data.ProfileID == session.user.id){
            CheckExist(session.user.id,data.PaymentID)
        }
    }

    useEffect(()=>{
        CheckAuth()
    },[])

    // Function to Go Back to Profile Page 
    const GoBack = async() =>{ 
        Router.push("/purchases")
    }
    const SendRequest = async()=>{
        document.getElementById("Sending").style.display = 'flex'
        const session = await Session 
        const Details = {
            ProfileID:session.user.id,
            PaymentID:data.PaymentID,
            Reason :  document.getElementById("Reason").value ,
            Approved:"Pending"
        }
        console.log(Details)
        if (Details.Reason != ""){
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Refund`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(Details)
            })
            const Response = await Request.json()
            if (Response.status == true){
                setTimeout(()=>{
                    document.getElementById("Sending").style.display = 'none'
                    document.getElementById("Reason").value = ""
                    CheckExist(session.user.id,data.PaymentID)
                },3000)
            }
        }
        if (Details.Reason == ""){
            alert("Please Enter a Reason")
            document.getElementById("Sending").style.display = 'none'
        }
        
    }

    return (
        <div className = "flex flex-col items-center justify-center">
            <h1 className = 'mt-4 text-xl'>
            Skillshub 📝
            </h1>
            <label className="text-[10px]">Refund Application</label>
            <button onClick={GoBack} className = 'fixed top-2  flex items-center justify-center left-2'><VscArrowCircleLeft size={30} />Back</button>
            
           
            <div className = 'rounded w-80 border mt-16 p-4 shadow-lg'>
            <div className="  self-center flex flex-col items-center justify-center">
                                <Image className = 'self-center' src = '/money.jpg' width = {200} height = {200} alt = 'No Payments Found'/>
                
            </div>
            <h2 className = ' font-bold mb-3 text-xl'>Refund Application</h2>
                <h1>Course Name : <label className="text-rose-600">{data.CourseName}</label></h1>
                <h1>CourseID : <label className="text-rose-600">{data.CourseID}</label></h1>
                <h1>Amount Paid :<label className="text-rose-600"> ${data.Amount}</label></h1>
                <h1>Payment Date : <label className="text-rose-600">{data.DateofPurchase}</label></h1>
                <h1>Payee Email : <label className="text-rose-600">{data.Email}</label></h1>
                <h1>Payee Name  : <label className="text-rose-600">{data.Name}</label></h1>
                
            </div>
            <h1 id = "Sending" className="border hidden transition duration-200 animate-slidedown p-2 bg-green-500 text-sm text-white w-80 items-center justify-center mt-3">Sending...</h1>


           {Exist == false &&
            <div className="w-80 flex flex-col  mt-6 mb-24 ">
            <h1 className = 'mt-4 mb-2 text-xl font-bold'>Refund Reason</h1>
            <textarea id = "Reason" className = 'border rounded w-80 text-md outline-black h-48 p-2' placeholder = "Enter the reason for refund"></textarea>
            <button onClick = {SendRequest} className = 'border flex items-center justify-center gap-3 bg-black mt-3 rounded text-sm active:shadow-button active:border-black active:bg-white active:text-black shadow-lg text-white py-3 px-4'>Submit Request 
                 <div >
                            <Image className = 'self-center' src = '/email.png' width = {18} height = {18} alt = 'No Payments Found'/>
            
             </div>  </button>
            </div>}
            {Exist == true && <label className=" mt-6 text-sm">Existing Applications </label> }


            {Exist == true  && 
            <div className=" w-80 flex flex-col border mb-24 p-4 mt-6 bg-white shadow-lg">
               
               {EditRequestStatus == "Deleting" && 
               <label className="flex w-full h-12 rounded shadow-lg items-center justify-center text-sm bg-rose-600 mb-3 gap-2 text-white border">
               Deleting... 
               <div >
                       <Image className = 'self-center' src = '/delete.png' width = {20} height = {20} alt = 'No Payments Found'/>
       
        </div>
               </label>}
               {EditRequestStatus == "Success" && 
                <label className = 'bg-green-600 shadow-lg flex gap-2 items-center justify-center text-sm h-12 mb-3 rounded flex items-center justify-center text-white'>
                Edited Successfully
                <div >
                        <Image className = 'self-center' src = '/like.png' width = {18} height = {18} alt = 'No Payments Found'/>
        
         </div> 
                </label>
                }
                {EditRequestStatus == "Failed" &&
                <label className="flex w-full h-12 rounded shadow-lg items-center justify-center text-sm bg-rose-600 mb-3 gap-2 text-white border">
                Failed 
                <div >
                        <Image className = 'self-center' src = '/fail.png' width = {20} height = {20} alt = 'No Payments Found'/>
        
         </div>
                </label>}
                <strong className="text-xl mb-6">Refund Request</strong>
                <h1>Request ID : {ExistingRefund.id}</h1>
                <h1>Status : 
                    {ExistingRefund.Approved == "Pending" && <strong className="text-sm text-orange-600">Waiting for Approval</strong>}
                    {ExistingRefund.Approved == "Approved" && <strong className="text-sm text-green-600">Approved</strong>}
                    </h1>
                <strong>Reason</strong>
                <p id = "ReasonEdit" contentEditable = {EditableOrNot} className=" outline-black text-sm p-4 border shadow-lg mt-3" >{ExistingRefund.Reason}</p>
               {EditableOrNot == false &&  
               <div className="flex mt-6 gap-3">
                <button onClick={EditMode} className="flex items-center justify-center bg-black text-sm text-white px-3 py-2 rounded  gap-2"><FilePenLine /> Edit</button>
                <button onClick={DeleteRequest} className="flex items-center justify-center bg-red-500 text-sm text-white px-3 py-2 rounded  gap-2">Delete</button>
              </div>}
                {EditableOrNot == true &&
                <div className="flex gap-3  mt-6"> 
                <button onClick={EditRequest} className="px-3 text-sm py-2 active:shadow-button active:bg-white active:border-black active:border active:text-black bg-green-600 rounded shadow-lg text-white">Save </button>
                <button onClick={EditMode} className="text-rose-600 text-sm active:text-black">Cancel</button>
               </div>}
            </div>}
           
          </div>
    )
}
export default  Page 