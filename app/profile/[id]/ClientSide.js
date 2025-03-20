'use client'
import { useRouter } from "next/navigation"
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useState,useEffect} from 'react'
import { PiContactlessPaymentThin } from "react-icons/pi";
import { getSession } from 'next-auth/react';
import { RiProfileLine } from "react-icons/ri";
import { Bs0Square } from "react-icons/bs";
import Componet from '../profilephoto'
import { IoBookOutline } from "react-icons/io5";
import Footer from './footer'
import Image from "next/image";
const bcryptjs = require("bcryptjs")

import useStore from './usestore'


import {collection, onSnapshot } from "firebase/firestore";




const page = ({profiledetails}) =>{
    const Session = getSession()
    // Variable which save the text changed 
    const Router = useRouter()
    const [Data,ChangeData] = useState(profiledetails) 
    const [ViewState,ChangeViewState] = useState("PersonalInfo")
    const File = useStore((state)=>state.sharedState)
    const [Purchases,ChangePurchases] = useState([])
   
    
   // Back To Courses page 
   const BackToCourses = () =>{
    Router.push("/home")
}
     

    //UseEffect to Fetch data before looding
    useEffect(()=>{
      
      const GetData = async()=>{
       
        const Details = await Session
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Payments/${Details.user.id}`)
        const Response = await Request.json()
        const Requestarr = Response.data 
        const NewArr = Requestarr.filter(data =>data.status === "Completed" )
        ChangePurchases(NewArr)
      if (Details == undefined){
        Router.push("/")
      }
      }
      GetData()
    },[])

    
    // View Component
const View = () =>{
  
  // Payments Card 
  const PaymentCard = (props) =>{

    // Function to Go to Refund application page 
    const GetRefund = () =>{
      Router.push("/refund/"+props.PaymentID)
    }
    const MoreInfo = () =>{
      Router.push("/payments/"+props.PaymentID)
    }
    var type
    if (props.mode == "payment"){
      type = "One Time"
    }
    if (props.mode == 'subscription'){
      type = "monthly"
    }
    return (
      <div className = 'flex   rounded-lg shadow-lg  flex-col gap-2 w-80  border px-3  py-2'>
        <h1 className = 'text-xl'>{props.CourseName}</h1>
        <div className = 'text-sm'>
          <p>PaymentID : <strong className = 'text-rose-500'>{props.PaymentID}</strong></p>
          <p>Payment Type : <strong className = ''>{type}</strong></p>
          <p >Amount : <strong className = 'text-green-600'>${props.Amount}  (in {props.Currency})</strong></p>
          <p>Payment Date : <strong className = ''>{props.DateofPurchase}</strong></p>
          <p className = 'mt-6 text-red-500'>Refund is only available within 24hr</p>
          <div className = 'mt-6 flex gap-3 '>
            <button className = ' hidden bg-rose-600 active:border active:border-black active:bg-white active:text-black font-bold text-white px-3 py-2 rounded-lg'>Cancel Subscription</button>
            <button onClick = {GetRefund} className = 'bg-green-500 px-3 py-2 text-white rounded-lg'>Get Refund </button>
            <button onClick = {MoreInfo}>More info</button>
          </div>
        </div>
      </div>
    )
  }
  
 

  

  if (ViewState == "Payments"){

    return <>
    
    <div className = 'flex items-center justify-center gap-6 flex-wrap'>
       {Purchases.length == 0 && <div className = 'flex flex-col items-center justify-center mt-12'>
        <Bs0Square size={60} />
        <h1 className = 'text-3xl'>No Payments</h1>
        <button onClick = {BackToCourses} className = 'mt-6 shadow-lg active:bg-white active:text-black border active:border-black bg-black text-white px-3 py-2 rounded-lg'>Go to Courses Page 📝</button>
        </div>}
       {Purchases.length != 0 && Purchases.map((data)=><PaymentCard mode = {data.mode} DateofPurchase={data.DateofPurchase} Currency={data.Currency} Amount={data.Amount}  CourseID ={data.CourseID} PaymentID= {data.PaymentID} ProfileID = {data.ProfileID} CourseName={data.CourseName} />)}
    </div>
    </>
  }
  


  // To Make a Change In Persona Info 
  const Change = () =>{
    document.getElementById("Change").style.display = 'none'
    document.getElementById("SaveAndCancelDiv").style.display = 'flex'
    
    document.getElementById("FullName").contentEditable = true
    document.getElementById("FullName").style.border  = '1px solid black'

    document.getElementById("Password").contentEditable = true
    document.getElementById("Password").style.border  = '1px solid black'
  }

  // Function To Close Change Info 
  const CloseChange = ()=>{
    document.getElementById("FullName").contentEditable = false
    document.getElementById("FullName").style.border  = '0px'
    document.getElementById("Change").style.display = 'flex'
    document.getElementById("SaveAndCancelDiv").style.display = 'none'
    document.getElementById("Password").contentEditable = false
    document.getElementById("Password").style.border  = '0px'
  
  }
  if (ViewState == "PersonalInfo"){
   
    useEffect(()=>{
      Live()
    },[])

    const SaveChanges = async() =>{
      CloseChange()
      document.getElementById("Change").innerHTML = 'Updating'
      document.getElementById("Updating").style.display = 'flex'
      document.getElementById("AlertOfUpdate").style.display = 'flex'

      const UnHashed = document.getElementById('Password').textContent
      const hashed = await bcryptjs.hash(UnHashed ,10)
      const email = Data.Email 
      const domain = window.location.origin
      const Details = {
        ImgSrc:'',
        FullName:document.getElementById("FullName").textContent,
        Password :UnHashed == 'hidden 😶‍🌫️' && Data.Password   || UnHashed != "hidden 😶‍🌫️" && hashed
      }
      const Request = await fetch('/api/email',{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,domain,type:'verify',Change:"Details",Details})
      })
      const Response = await Request.json()
      if (Response.status == true){
        document.getElementById("Updating").style.display = 'none'
        document.getElementById("AlertOfUpdate").style.display = 'none'
        document.getElementById("Change").innerHTML = 'ChangeDetails'

      }
    }
    return (
      <>
      
      <Componet data = {Data}/>
       <div className = 'flex flex-col w-80 items-center justify-center'>
        <p>Personal Information</p>
        <label className = 'mt-6 self-start text-lg font-bold '>Email :</label>
        <p id = "Email" className = 'self-start p-2 w-80 text-xl'>{Data.Email} </p>
       <label className = 'mt-6 self-start text-lg font-bold  '>FullName :</label>
       <p id = "FullName" className = 'self-start  p-2 w-80 text-xl'>{Data.FullName}   </p>
       <label className = 'mt-6 self-start text-lg  font-bold  '>Password :</label>
       <p id = "Password" className = 'self-start  p-2 w-80 text-xl'>hidden 😶‍🌫️</p>
       <button id = "Change" onClick = {Change} className = 'py-3 px-2 border border-black bg-black text-white rounded-lg '>Change Details</button>
       <div id = "SaveAndCancelDiv" className = 'hidden mt-6 gap-3'>
        <button onClick ={SaveChanges}  className = 'py-2 hover:ring-2 transition duration-200 active:translate-y-2 shadow-lg hover:ring-black px-4 bg-green-600 text-white rounded'>Save</button>
        <button onClick={CloseChange} className = 'hover:text-rose-600'>Cancel</button>
       </div>
       <label id = "AlertOfUpdate" className = 'mt-6 hidden animate-jump transition duration-200 px-3 py-2 text-xs rounded  border border-black bg-green-600 text-white'>Check Your Email for Completing Update</label>

       </div>
    </>
    )
  }
}
    

    // Function To Change The View 
    const ChangeView = (event) =>{
      const id = event.target.id
      console.log(id) 
      if (id == "PersonalInfo"){
        ChangeViewState("PersonalInfo")
        // To Change Color Of Button 
        document.getElementById(id).style.backgroundColor = "black"
        document.getElementById(id).style.color = "white"
        document.getElementById("Payments").style.backgroundColor = "white"
        document.getElementById("Payments").style.color = "black"
       
      }
      
      if (id == 'Payments'){
        ChangeViewState("Payments")
        document.getElementById(id).style.backgroundColor = "black"
        document.getElementById(id).style.color = "white"
        document.getElementById("PersonalInfo").style.backgroundColor = "white"
        document.getElementById("PersonalInfo").style.color = "black"
      }
    }

    
    return (
    <div className = 'flex flex-col  bg-grey mb-24 items-center'>
      <p id = "Updating" className = 'fixed top-0 w-full h-12 text-lg text-white  hidden items-center transition-transform duration-500 ease-out animate-slideDown  justify-center  text-center z-20 te bg-green-600'>Updating</p>
      <title>Dr Prashant Jhim @SkillsHub📝</title>
        <button onClick={BackToCourses} className = 'z-10 flex items-center justify-center p-2 rounded  bg-transparent fixed top-2 left-2  rounded'><VscArrowCircleLeft size={30} /> Back</button>
        <h1 className = 'text-3xl mt-3'>SkillsHub📝</h1>
       <div className = 'w-full mt-6 flex-wrap flex items-center justify-center gap-6'>
        <button onClick = {ChangeView} id = "PersonalInfo" className = 'bg-black hover:bg-black focus:ring-2 focus:ring-blue-500 hover:text-white flex gap-2 items-center justify-center text-white py-3 px-2 rounded-lg'><RiProfileLine size={20} /> Account Details</button>
        <button onClick = {ChangeView} id = "Payments" className = 'flex gap-2 hover:bg-black focus:ring-2 focus:ring-blue-500 hover:text-white py-3 rounded-lg px-2 items-center'><PiContactlessPaymentThin size={20}/>Purchases</button>
       </div>
       <div className ='flex mt-12 gap-6  flex-wrap justify-center items-center'>
          <View/>
        </div>
       
        <Footer/>
    </div>)
}
export default page