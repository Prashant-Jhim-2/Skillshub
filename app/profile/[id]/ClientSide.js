'use client'
import { useRouter } from "next/navigation"
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useState,useEffect} from 'react'
import { PiContactlessPaymentThin } from "react-icons/pi";
import { getSession } from 'next-auth/react';
import { RiProfileLine } from "react-icons/ri";
import Componet from '../profilephoto'
import { IoBookOutline } from "react-icons/io5";
import Footer from './footer'
import Image from "next/image";

import useStore from './usestore'

import db from './firebase'




const page = ({Data}) =>{
    const Session = getSession()
    // Variable which save the text changed 
    const Router = useRouter()
    const [ViewState,ChangeViewState] = useState("PersonalInfo")
    const File = useStore((state)=>state.sharedState)
   
    
   
     

    //UseEffect to Fetch data before looding
    useEffect(()=>{
      
      const GetData = async()=>{
        console.log("i m been Called")
        const Details = await Session
       
      if (Details == undefined){
        Router.push("/")
      }
      }
      GetData()
    },[])

    
    // View Component
const View = () =>{

  
  
  const Card = (props) =>{
    const [Details,ChangeDetails] = useState(undefined)
    const [Job,ChangeJob] = useState("Select The Status")
   
    console.log(Details)
    // JobCard 
   const JobCard = () =>{
    if (Job == "Have Job"){
      return (
        <>
         <input id = {`${props.Type}Name`}  className = 'w-80 h-12 border p-2 rounded-lg outline-black border-black '  type ='text' placeholder = {`Enter The Company Name` }/>
            <input id = {`${props.Type}State`} className = 'w-80 h-12 border p-2 rounded-lg outline-black border-black '  type ='text' placeholder = "Enter The State" />
            <input id = {`${props.Type}Country`} className = 'w-80 h-12 border p-2 rounded-lg outline-black border-black '  type ='text' placeholder = "Enter The Country" />
            <div className = 'flex gap-6'>
              <button id = {`${props.Type}`}  onClick={SaveDetails} className = 'px-3  py-2 border text-white bg-green-500 rounded-lg'>Save ✅</button>
              <button>Clear</button>
            </div>
        </>
      )
    }
    
   }
   
   const [Status,ChangeDisplay] = useState("hidden")
   // Trigger to Show 
   const Trigger = () =>{
    const Previous = Job
    if (Status == "hidden"){
     ChangeDisplay('flex')
     ChangeJob("Select The Status")
     
      return 0
    }
    if (Status == "flex"){
      ChangeDisplay('hidden')
      return 0
    }
   }

   // Function To Select Job Status 
   const SelectStatus = (event)=>{
    const id = event.target.id
    ChangeJob(id)
    ChangeDisplay("hidden")
    
   
   if (id != "Student" && id == "Have Job"){
    event.target.style.backgroundColor = 'black'
    event.target.style.color = 'white'
    document.getElementById("Student").style.backgroundColor = 'white'
    document.getElementById("Student").style.color = 'black'
    
    return 0
    
   }
   if (id != "Have Job"  && id == "Student"){
    event.target.style.backgroundColor = 'black'
    event.target.style.color = 'white'
    document.getElementById("Have Job").style.backgroundColor = 'white'
    document.getElementById("Have Job").style.color = 'black'
    return 0
   }
   
   }

    // Function To Save The Details 
  const SaveDetails = async(event) =>{
    const session = await Session
    const id = event.target.id
    const Details = {
      isStudent : id == "Job",
      Level:id,
      Profile:session.user.id,
      Name:document.getElementById(`${props.Type}Name`).value , 
      State:document.getElementById(`${props.Type}State`).value,
      Country:document.getElementById(`${props.Type}Country`).value
    }
    ChangeDetails(Details)
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Education`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Details)
    })
    const Response = await Request.json()
    console.log(Response)


 }

 
    if (Details == undefined && props.Type != "Job"){
      return (
        <>
             <input id = {`${props.Type}Name`} className = 'w-80 h-12 border p-2 rounded-lg outline-black border-black '  type ='text' placeholder = {`Enter The ${props.Type} Name` }/>
            <input id = {`${props.Type}State`} className = 'w-80 h-12 border p-2 rounded-lg outline-black border-black '  type ='text' placeholder = "Enter The State" />
            <input id = {`${props.Type}Country`} className = 'w-80 h-12 border p-2 rounded-lg outline-black border-black '  type ='text' placeholder = "Enter The Country" />
            <div className = 'flex gap-6'>
              <button onClick={SaveDetails} id = {props.Type} className = 'px-3  py-2 border text-white bg-green-500 rounded-lg'>Save ✅</button>
              <button>Clear</button>
            </div>
            </>
      )
    }
    if (Details == undefined && props.Type == "Job"){
      return (
        <>
        <div className = 'flex flex-col'>
          <button onClick = {Trigger} className = 'w-80  px-3 overflow py-2 border-2 border-black'>{Job}</button>
          <ul id = "JobList" className = {`w-80 ${Status}  flex-col `}>
            <li onClick = {SelectStatus} id = 'Student' className = 'py-3 hover:bg-black hover:text-white border w-80 text-center'>Student</li>
            <li onClick = {SelectStatus} id = "Have Job" className = 'py-3 hover:bg-black hover:text-white border w-80 text-center'>Have Job</li>
          </ul>
        </div>
        <JobCard/>
        </>
      )
    }

   
    if (Details != undefined ){
      return (
      <>
      <div className = ' border  w-96   flex flex-col '>
        <div className = 'relative w-full h-48'>
        <Image
         src = "https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/photos%2Fpexels-pixabay-159844%20(1).jpg?alt=media&token=ab5dec5f-338d-4b20-af29-bd80abe3f5a6"
         layout='fill'
         objectFit="cover"
         />
        </div>
       <div className = 'flex flex-col p-6'>
       <label className = ''>Name </label>
        <p className = 'text-blue-600 text-xl'>{Details.Name}</p>

         <label className = 'mt-6'>State</label>
         <p className = 'text-blue-600 text-xl'>{Details.State}</p>

         <label className = 'mt-6'>Country</label>
         <p className = 'text-blue-600 text-xl'>{Details.Country}</p>
         <div className = 'mt-6 flex gap-3'>
          <button className = 'text-xl border bg-black text-white  border-black px-3 py-2 rounded-lg'>Edit 📝</button>
          <button className = 'text-rose-600'>Delete</button>
         </div>
       </div>
      </div>
      </>
      )
    }
  }

   
      
  if (ViewState == "Education"){
    return (
      <>
      <div className = " flex items-center flex-col gap-3">
        <label>High School </label>
       <Card Type = 'School'/>

        <label className = 'mt-12'>College </label>
        <Card Type = "College" />
        <label className = 'mt-12'>Job :</label>
        <Card Type = "Job" />
       </div>
      </>
    )
  }
  if (ViewState == "Purchases"){
    return <></>
  }
  


  // To Make a Change In Persona Info 
  const Change = () =>{
    document.getElementById("Change").style.display = 'none'
    document.getElementById("SaveAndCancelDiv").style.display = 'flex'
    document.getElementById("Email").contentEditable = true
    document.getElementById("Email").style.border  = '1px solid black'
    
    document.getElementById("FullName").contentEditable = true
    document.getElementById("FullName").style.border  = '1px solid black'

    document.getElementById("Password").contentEditable = true
    document.getElementById("Password").style.border  = '1px solid black'
  }
  if (ViewState == "PersonalInfo"){
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
       <p id = "Password" className = 'self-start  p-2 w-80 text-xl'>********  </p>
       <button id = "Change" onClick = {Change} className = 'py-3 px-2 border border-black bg-black text-white rounded-lg '>Change Details</button>
       <div id = "SaveAndCancelDiv" className = 'hidden mt-6 gap-3'>
        <button  className = 'py-2 hover:ring-2 transition duration-200 active:translate-y-2 shadow-lg hover:ring-black px-4 bg-green-600 text-white rounded'>Save</button>
        <button className = 'hover:text-rose-600'>Cancel</button>
       </div>
       </div>

       
        </>
    
    )
  }
}
    // Back To Courses page 
    const BackToCourses = () =>{
        Router.push("/home")
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
        document.getElementById("Education").style.backgroundColor = "white"
        document.getElementById("Education").style.color = "black"
        document.getElementById("Payments").style.backgroundColor = "white"
        document.getElementById("Payments").style.color = "black"
       
      }
      if (id == "Education"){
        ChangeViewState("Education")
        document.getElementById(id).style.backgroundColor = "black"
        document.getElementById(id).style.color = "white"
        document.getElementById("Payments").style.backgroundColor = "white"
        document.getElementById("Payments").style.color = "black"
        document.getElementById("PersonalInfo").style.backgroundColor = "white"
        document.getElementById("PersonalInfo").style.color = "black"
       
      }
      if (id == 'Payments'){
        ChangeViewState("Payments")
        document.getElementById(id).style.backgroundColor = "black"
        document.getElementById(id).style.color = "white"
        document.getElementById("Education").style.backgroundColor = "white"
        document.getElementById("Education").style.color = "black"
        document.getElementById("PersonalInfo").style.backgroundColor = "white"
        document.getElementById("PersonalInfo").style.color = "black"
      }
    }

    
    return (
    <div className = 'flex flex-col  bg-grey mb-24 items-center'>
      <title>Dr Prashant Jhim @SkillsHub📝</title>
        <button onClick={BackToCourses} className = 'z-10 flex items-center justify-center p-2 rounded  bg-transparent fixed top-2 left-2  rounded'><VscArrowCircleLeft size={30} /> Back</button>
        <h1 className = 'text-3xl mt-3'>SkillsHub📝</h1>
       <div className = 'w-full mt-6 flex-wrap flex items-center justify-center gap-6'>
        <button onClick = {ChangeView} id = "PersonalInfo" className = 'bg-black hover:bg-black focus:ring-2 focus:ring-blue-500 hover:text-white flex gap-2 items-center justify-center text-white py-3 px-2 rounded-lg'><RiProfileLine size={20} /> Account Details</button>
        <button onClick = {ChangeView} id = "Payments" className = 'flex gap-2 hover:bg-black focus:ring-2 focus:ring-blue-500 hover:text-white py-3 rounded-lg px-2 items-center'><PiContactlessPaymentThin size={20}/>Purchases</button>
        <button onClick = {ChangeView} id = "Education" className = 'flex gap-2 hover:bg-black focus:ring-2 focus:ring-blue-500 hover:text-white py-3 rounded-lg px-2 items-center' ><IoBookOutline size = {20} /> Educational Details</button>
       </div>
       <div className ='flex mt-12 gap-6  flex-wrap justify-center items-center'>
          <View/>
        </div>
       
        <Footer/>
    </div>)
}
export default page