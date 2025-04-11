'use client'
import { useParams, useRouter } from "next/navigation"
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useState,useEffect} from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { PiContactlessPaymentThin } from "react-icons/pi";
import { getSession } from 'next-auth/react';
import { RiProfileLine } from "react-icons/ri";
import { Bs0Square } from "react-icons/bs";
import Componet from '../profilephoto'
import { IoBookOutline } from "react-icons/io5";
import {db} from '@/app/firebase'
import Footer from './footer'
import Image from "next/image";
const bcryptjs = require("bcryptjs")

import useStore from './usestore'






const page = ({profiledetails}) =>{
    const Session = getSession()
    const params = useParams()
    // Variable which save the text changed 
    const Router = useRouter()
    const [Authenticate,ChangeAuthenticate] = useState(false)
    const [Data,ChangeData] = useState(profiledetails) 
    const [ViewState,ChangeViewState] = useState("PersonalInfo")
    
   
    
   // Back To Courses page 
   const BackToCourses = () =>{
    Router.push("/home")
}
     

    //UseEffect to Fetch data before looding
    useEffect(()=>{
      var unsubscribe
      const GetData = async()=>{
       
        const Details = await Session
        // Function to Check Authentication of User login 
      if (Details != undefined){
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${Details.user.id}`  )
        const Response = await Request.json() 
        if (Response.status == false){
          Router.push("/")
        }
        if (Response.status == true){
          if (Details.user.id == params.id){
            ChangeAuthenticate(true)
          }
        }
        if ( Response.status == false){
          ChangeAuthenticate(false)      
      }
    }
  }

      GetData()



     
    unsubscribe = onSnapshot(
      doc(db, 'users', params.id), // Specify your collection and document ID
      (snapshot) => {
        if (snapshot.exists()) {
          // Get data from snapshot and update state
          const data = snapshot.data()
          if (data.Email != profiledetails.Email || data.ImgSrc != profiledetails.ImgSrc || data.FullName != profiledetails.FullName || data.Password != profiledetails.Password){
            ChangeData(data)
          }
          
          
          
        } else {
          console.log("Document not found");
        }
      },
      (error) => {
        console.error('Error fetching live updates:', error);
      }
      );
      return () => {
        unsubscribe(); // Cleanup the listener on component unmount
      };

    },[])

    
    // View Component
const View = () =>{
  
 
  
 

  

 
  


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
      
      <Componet Authenticate = {Authenticate} data = {Data}/>
       <div className = 'flex flex-col w-80 items-center justify-center'>
        <p>Personal Information</p>
        <label className = 'mt-6 self-start text-lg font-bold '>Email :</label>
        <p id = "Email" className = 'self-start p-2 w-80 text-xl'>{Data.Email} </p>
       <label className = 'mt-6 self-start text-lg font-bold  '>FullName :</label>
       <p id = "FullName" className = 'self-start  p-2 w-80 text-xl'>{Data.FullName}   </p>
     {Authenticate && <>
      <label className = 'mt-6 self-start text-lg  font-bold  '>Password :</label>
       <p id = "Password" className = 'self-start  p-2 w-80 text-xl'>hidden 😶‍🌫️</p>
        <button id = "Change" onClick = {Change} className = 'py-3 px-2 border border-black bg-black text-white rounded-lg '>Change Details</button>
       <div id = "SaveAndCancelDiv" className = 'hidden mt-6 gap-3'>
        <button onClick ={SaveChanges}  className = 'py-2 hover:ring-2 transition duration-200 active:translate-y-2 shadow-lg hover:ring-black px-4 bg-green-600 text-white rounded'>Save</button>
        <button onClick={CloseChange} className = 'hover:text-rose-600'>Cancel</button>
       </div>
      </>}
       <label id = "AlertOfUpdate" className = 'mt-6 hidden animate-jump transition duration-200 px-3 py-2 text-xs rounded  border border-black bg-green-600 text-white'>Check Your Email for Completing Update</label>

       </div>
    </>
    )
  }
}
    

   

    
    return (
    <div className = 'flex flex-col  bg-grey mb-24 items-center'>
      <p id = "Updating" className = 'fixed top-0 w-full h-12 text-lg text-white  hidden items-center transition-transform duration-500 ease-out animate-slideDown  justify-center  text-center z-20 te bg-green-600'>Updating</p>
      <title>Dr Prashant Jhim @SkillsHub📝</title>
        <button onClick={BackToCourses} className = 'z-10 flex items-center justify-center p-2 rounded  bg-transparent fixed top-2 left-2  rounded'><VscArrowCircleLeft size={30} /> Back</button>
        <h1 className = 'text-2xl mt-3'>SkillsHub📝</h1>
        <label>Profile👨🏻‍💻</label>
       <div className = 'w-full mt-6 flex-wrap flex items-center justify-center gap-6'>
       </div>
       <div className ='flex mt-12 gap-6  flex-col justify-center items-center'>
          <View/>
        </div>
       
        <Footer/>
    </div>)
}
export default page