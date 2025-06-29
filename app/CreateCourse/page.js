'use client'
import { getSession } from 'next-auth/react';
import Image from 'next/image'
import {useState,useEffect} from 'react'
import { useRouter } from 'next/navigation';
import { useRef } from "react";
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Page = () =>{
    const textareaRef = useRef(null);
    const Router = useRouter()
    const [File,ChangeFile] = useState("https://static.wikia.nocookie.net/peppapig/images/6/61/Peppa_Pig.png/revision/latest?cb=20240627160159")
    const [UploadableFile,ChangeUploadableFile] = useState(null)
    const Session = getSession()
    const [NotifyText,ChangeNotifyText] = useState("")
    const [wordscount,changewordcount] = useState(0)
    const [OptionBtntxt,changeoptbtntxt] = useState("Select The Level 🚗")
    const [PriceType,ChangePriceType] = useState("Select Payment Type 💸")
    const [TopicCovered,ChangeTopicCovered] = useState([])
    const [AlertofFormat,ChangeAlertofFormat] = useState("")
    const [AlertForTopic,ChangeAlertForTopic] = useState("")

    const handleInput = () => {
        const textarea = textareaRef.current;
        changewordcount(textarea.value.length)
        textarea.style.height = "auto"; // Reset height to calculate scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
    }
    // Function To Check Whether User is Professor or Customer
    const CheckFirst = async() =>{
        const Details = await Session 
       if (Details != undefined){
         // Function to Check User 
         const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${Details.user.id}`)
         const Response = await Request.json()
         if (Response.status == true){
            const Type = Response.Details.Type
            if (Type == "Customer"){
                Router.push('/home')
            }
         }
         if (Response.status == false){
            Router.push('/')
         }
       }
        
    }
    // Image Upload Function
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log(file)
        if (file) {
         console.log(file)
         ChangeUploadableFile(file)
         const Reader = new FileReader()
         Reader.onload = () => ChangeFile(Reader.result)
         Reader.readAsDataURL(file)
        }
      };
      const handlelclick  = () =>{
       document.getElementById("File").click()
      }

    useEffect(()=>{
        CheckFirst()
    },[])

    // Function to Show Levels Option 
    const ShowOptions = (event)=>{
        const id = event.target.id
        if (id == 'TypesDiv'){
            document.getElementById("PriceTypediv").style.display = 'flex'
        }
        if (id == 'lvlbtn'){
            document.getElementById("optionsdiv").style.display = 'flex'
        }
    }
    
    // Function to Select The Option 
    const SelectOption = (event) =>{
        const id = event.target.id 
        changeoptbtntxt(id)
        document.getElementById("optionsdiv").style.display = 'none'
    }
    // Function to Select The Option 
    const SelectType = (event) =>{
        const id = event.target.id 
        ChangePriceType(id)
        document.getElementById("PriceTypediv").style.display = 'none'
    }
  
    // Function To Add Topics 
    const AddTopics = ()=>{
        const value = document.getElementById("TopicName").value
       if (value != ''){
        const NewTopic = {
            Name:value ,
            index:TopicCovered.length
        }
        const NewArr = [...TopicCovered,NewTopic]
        ChangeTopicCovered(NewArr)
        document.getElementById("TopicName").value = ''
       }
    }
    // Function to Check which Formats are Checked 
    const Formats = () =>{
        const ArrOfFormats = []
        if (document.getElementById("MCQ").checked){
            ArrOfFormats.push({Name:"MCQ",index:ArrOfFormats.length})
        }
        if (document.getElementById("Projects").checked){
            ArrOfFormats.push({Name:"Projects",index:ArrOfFormats.length})
        }
        if (document.getElementById("Quiz").checked){
            ArrOfFormats.push({Name:"Quiz",index:ArrOfFormats.length})
        }

        return ArrOfFormats
    }
      // Function to handle change 
      const handlechange = (event) =>{
        const component = event.target.id
        if (component == 'CourseName'){
            document.getElementById("CourseName").style.borderBottomColor = 'black'
        }
        if (component == 'FieldName'){
            document.getElementById("FieldName").style.borderBottomColor = 'black'
        }
        if (component == 'Duration'){
            document.getElementById("Duration").style.borderBottomColor = 'black'
        }
        if (component == 'MCQ' || component == 'Projects' || component == "Quiz"){
            ChangeAlertofFormat("")
        }
        if (component == "lvlbtn"){
            document.getElementById("lvlbtn").style.borderColor = 'black'
        }
        if (component == "Description"){
            document.getElementById("Description").style.borderColor = 'black'
        }
        if (component == "Price"){
            document.getElementById("Price").borderBottomColor = 'black'
        }
        if (component == 'TopicName'){
            ChangeAlertForTopic("")
        }
    }
    // Function To Publish the Course 
    const Publish = async()=>{
        const session = await Session
        const ResultOfFormat = Formats()
        document.getElementById("Notify").style.display = 'flex'

        // Part Of Uploading Image 
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_apiKey,
            authDomain:  process.env.NEXT_PUBLIC_authDomain,
            projectId:  process.env.NEXT_PUBLIC_projectId,
            storageBucket:  process.env.NEXT_PUBLIC_storageBucket,
            messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
            appId:  process.env.NEXT_PUBLIC_appId,
          };
          const app = initializeApp(firebaseConfig);
          const storage = getStorage(app);
          const db = getFirestore(app);
      
      
          // Function To Upload Image and Get ImgSrc 
          const UploadImg = async()=>{
            const storageref = ref(storage,`photos/${UploadableFile.name}`)
            await uploadBytes(storageref,UploadableFile)
            const url = await getDownloadURL(storageref)
            return url 
         }
         var ImgUrl = File
         if (UploadableFile != undefined){
            ImgUrl = await UploadImg()
         }
        const Details = {
            ProfessorId:session.user.id,
            ImgSrc:ImgUrl,
            Name:document.getElementById("CourseName").value ,
            Field:document.getElementById("FieldName").value ,
            Duration:document.getElementById("Duration").value ,
            Format : ResultOfFormat,
            Level:OptionBtntxt,
            Description : document.getElementById("Description").value,
            Price:document.getElementById("Price").value ,
            Topics:TopicCovered,
            PriceType : PriceType,
            content:[],
            Enrolled:[]
        }
        console.log(Details)
        // Scrollup Function
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Adds a smooth scroll effect
          });

        // Parameters To Check Before Publishing 
        const NameCheck = Details.Name != ''
        const FieldCheck = Details.Field != ''
        const DurationCheck = Details.Duration > 0 && Details.Duration != ''
        const FormatCheck = Details.Format.length != 0
        const LevelCheck = Details.Level != 'Select The Level 🚗'
        const DescCheck = Details.Description != ""
        const PriceCheck = Details.Price > 0 
        const TopicsCheck = Details.Topics.length != 0
        const PriceTypeCheck = Details.PriceType != "Select Payment Type 💸"

        if (!NameCheck){
            document.getElementById("CourseName").style.borderBottomColor = 'crimson'
            document.getElementById("CourseName").style.borderBottomWidth = '2px'
        }
        if (!FieldCheck){
            document.getElementById("FieldName").style.borderBottomColor = 'crimson'
            document.getElementById("FieldName").style.borderBottomWidth = '2px'
        }
        if (!DurationCheck){
            document.getElementById("Duration").style.borderBottomColor = 'crimson'
            document.getElementById("Duration").style.borderBottomWidth = '2px'
        }
        if (!FormatCheck){
           ChangeAlertofFormat("( Select atleast one )")
        }
        if (!LevelCheck){
            document.getElementById("lvlbtn").style.borderWidth = '2px'
            document.getElementById("lvlbtn").style.borderColor = "crimson"
         }
        if (!DescCheck){
            document.getElementById("Description").style.borderColor = "crimson"
            document.getElementById("Description").style.borderWidth = '2px'
        }
        if (!PriceCheck){
            document.getElementById("Price").style.borderBottomColor = "crimson"
            document.getElementById("Price").style.borderBottomWidth = '2px'
        }
        if (!PriceTypeCheck){
            document.getElementById("TypesDiv").style.borderBottomColor = "crimson"
            document.getElementById("TypesDiv").style.borderBottomWidth = '2px'
        }
        if (!TopicsCheck){
            ChangeAlertForTopic("( Add atleast one )")
        }

        if (NameCheck && PriceTypeCheck && FieldCheck && DurationCheck && FormatCheck && LevelCheck && DescCheck && PriceCheck && TopicsCheck){
            document.getElementById("Notify").style.color = 'green'
            ChangeNotifyText("Publishing...🐟")
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/AddCourse`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({Details})
            })
            const Response = await Request.json()
            if (Response.status == true){
                Router.push("/home")
            return 0
            }
            
        }
        document.getElementById("Notify").style.color = 'crimson'
        ChangeNotifyText("Clear Errors 🛑")
        
    }

    // Function to Go back to Home 
    const GoBack = ()=>{
        Router.push('/home')
    }
    return (
        <div className = 'flex relative  flex-col items-center justify-center '>
            <button onClick={GoBack} className = 'z-10 fixed focus:ring  hover:bg-white hover:text-black  border border-black bg-black text-white  rounded-lg py-2 px-4 top-2 left-2'>Back</button>
            <button onClick={Publish} className = 'z-10 fixed top-2 p-3  bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 right-2'>Publish</button>
            <h1 className =' mt-6 text-3xl'>TryMyBoard📝</h1>
            <p id = "Notify" className = 'mt-2 hidden'>{NotifyText}</p>
            <div className = 'relative w-80 h-80 mt-12' id = "Image">
                <Image
                src = {File}
                alt="Course Image"
                layout = 'fill'
                objectFit="scale-down"
                className = 'border shadow-lg rounded-lg'
                />
            </div>
            <input accept="image/jpeg" onChange={handleImageChange} id = "File" type = 'file' className = 'w-0 hidden' />
            <button onClick={handlelclick} className = 'border bg-black p-2 text-white rounded-lg mt-6'>Upload</button>

            <div className = 'mt-6 ml-2 items-start flex flex-col ' id = "Form">
                <label  className = 'text-sm'>Course Name</label>
                <input onChange={handlechange} id = "CourseName" className ='border-0 mb-6 active:border-b-2 outline-black shadow-sm border-b w-80 text-xl flex p-2' type = 'text' placeholder = "Enter The Course Name " />
                <label className = 't text-sm'>Field </label>
                <input onChange={handlechange} id = "FieldName" className ='border-0  mb-6 outline-black shadow-sm border-b w-80 text-xl flex p-2' type = 'text' placeholder = "Enter The Field Name " />
                <label className = ' text-sm'>Duration</label>
                <input onChange={handlechange} id = "Duration" className ='border-0 mb-6 outline-black shadow-sm border-b w-80 text-xl flex p-2' type = 'number' placeholder = "Duration in Weeks " />
                <label className = ' text-sm'>Course Format <strong className = "text-xs text-rose-600" >{AlertofFormat}</strong></label>
                <div className ='flex   gap-3 mt-2 pl-2'>
                    <input onChange={handlechange} id = 'MCQ' className = 'w-6 accent-black' type='checkbox'  />
                    <label>MCQ</label>
                </div>
                <div className ='flex  gap-3 mt-2 pl-2'>
                    <input onChange={handlechange} id = "Projects" className = 'w-6 accent-black' type='checkbox'  />
                    <label>HandOns Projects</label>
                </div>
                <div className ='flex  gap-3 mt-2 mb-6 pl-2'>
                    <input onChange={handlechange} id = "Quiz" className = 'w-6 accent-black' type='checkbox'  />
                    <label>Quizs</label>
                </div>
                <label className = 'mt-2'>Course Level</label>
                <div className="relative w-80">
 
                <button  id = "lvlbtn"  onClick={ShowOptions} className = 'w-full active:bg-black active:text-white  mb-6 border p-2'>{OptionBtntxt} </button>
  
                <ul id = "optionsdiv" className="absolute flex-col hidden left-0 top-12 outflow-none right-0  bg-white border  rounded-md shadow-lg ">
                 <li onClick={SelectOption} id = 'Beginner Friendly 👶' className="px-4 py-2 cursor-pointer hover:border-b hover:bg-black hover:text-white">Beginner Friendly 👶</li>
                 <li onClick={SelectOption}  id = 'Intermediate-Friendly 🐣' className="px-4 py-2 cursor-pointer hover:bg-black hover:text-white">Intermediate-Friendly 🐣</li>
                 <li onClick={SelectOption}  id = 'Advanced-Friendly 👨‍🦰' className="px-4 py-2 cursor-pointer hover:bg-black hover:text-white">Advanced-Friendly 👨‍🦰</li>
                
               </ul>
               </div>
                <label className = 'ml-2 mb-2 text-sm'>Course Description    <strong>{wordscount}</strong> words</label>

                <textarea onChange={handlechange} id = "Description"  ref={textareaRef} onInput={handleInput} placeholder = 'Enter The Description' className = 'border mb-6   outline-black w-[370px]  p-2 rounded-lg shadow-lg'/>
                <label className = 'ml-2 mb-2 text-sm'>Price (in Canadian Dollars )</label>
                <input onChange={handlechange} id = "Price" className ='border-0 mb-6  outline-black shadow-sm border-b w-80 text-xl flex p-2' type = 'number' placeholder = "Enter The Price " />
                <label className = 'ml-2 mb-2 text-sm'>Type:</label>
                <div className = 'relative mb-6 w-80'>
                 <button id = 'TypesDiv' onClick={ShowOptions} className = ' border h-12  w-full'>{PriceType}</button>
                <ul id = "PriceTypediv" className="absolute flex-col hidden gap-2 left-0 top-14 outflow-none right-0  bg-white border  rounded-md shadow-lg ">
                 <li onClick={SelectType} id = 'OneTime' className="px-4 h-12 items-center justify-center flex py-2cursor-pointer hover:border-b hover:bg-black hover:text-white">OneTime 1️⃣</li>
                 <li onClick={SelectType}  id = 'Monthly' className="px-4 h-12 items-center justify-center flex py-2 cursor-pointer hover:bg-black hover:text-white">Monthly 🔁</li>                
               </ul>
                </div>
                <label className = 'ml-2 mb-2 text-sm'>Topic Covered <strong className = "text-xs text-rose-600" >{AlertForTopic}</strong></label>
               <div className = 'w-80 flex'>
               <input onChange={handlechange} id = 'TopicName' className = 'w-3/4 outline-black p-2 border-0 border-b' type = "text" placeholder = 'Enter The Topic' />
               <button onClick = {AddTopics} className = 'border p-3 bg-black text-white rounded-lg'>Add</button>
               </div>
               <ul className ='mt-6 list-decimal  ml-6  mb-12'>
                  {TopicCovered.map((data)=>(
                    <li className = 'mt-3' id = 'l'>{data.Name} <button id = {data.index} className = 'text-xs ml-3  border border-black p-1 rounded-lg'>Delete ❌</button></li>
                  ))}
                </ul>
            </div>
        </div>
    )
}
export default Page