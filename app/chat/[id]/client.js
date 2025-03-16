'use client'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {useState,useEffect} from 'react'
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
const Page = ({data}) =>{
  const [UserDetails,ChangeUserDetails] = useState({})
  const [VideoUrl,ChangeVideoUrl] = useState('')
  const [PhotoFile,ChangePhotoFile] = useState(undefined)
  const [VideoFile,ChangeVideoFile] = useState(undefined)
  const [PhotoUrl,ChangePhotoUrl] = useState('')
  const Router = useRouter()
  const [Chats,ChangeChats] = useState([])
  const session = getSession()
  // Function To Check Authication 
  const CheckAuth = async() =>{
    const Session = await session 
    if (Session != undefined){
      const id = Session.user.id 
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
      const Response = await Request.json()
      if (Response.status == true){
        console.log(Response)
        ChangeUserDetails(Response.Details)
      }
      if (Response.status == false){
        Router.push("/")
      }
    }
    if (Session == undefined){
      Router.push('/')
    }
  }

  //UseEffect to CheckAuth 
  useEffect(()=>{
    CheckAuth()
    document.getElementById("BringUp").scrollIntoView({behavior:"smooth"})
  },[])


  // Function to Give Date 
  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options);
  
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions).toLowerCase();
  
    return `${formattedDate} : ${formattedTime}`;
  };


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
        const UploadImg = async(UploadableFile)=>{
          const storageref = ref(storage,`photos/${UploadableFile.name}`)
          await uploadBytes(storageref,UploadableFile)
          const url = await getDownloadURL(storageref)
          return url 
       }
       
      
  // Send Chat 
  const Send = async() =>{
    const date = new Date()
    const datestring = formatDate(date)
    const value = document.getElementById("Chat").value 
    if (value != '' || PhotoFile != undefined || VideoFile != undefined){
      document.getElementById("Chat").value = ''
      var UploadableURLPhoto = ''
      var UploadableURLVideo = ''

      if (PhotoFile != undefined){
         UploadableURLPhoto = await UploadImg(PhotoFile)
      }
      if (VideoFile != undefined){
        UploadableURLVideo = await UploadImg(VideoFile)
      }
      const Details = {
        id :UserDetails.id ,
        FullName:UserDetails.FullName,
        Chat : value ,
        Photo:UploadableURLPhoto,
        date:datestring
      }
      console.log(Details)
      const newarr = [...Chats,Details]
      ChangeChats(newarr)
      document.getElementById("PreviewPhoto").style.display = 'none'
      document.getElementById("Photo").innerHTML = 'Photo 📸'
      ChangePhotoFile(undefined)
      document.getElementById("BringUp").scrollIntoView({behavior:"smooth"})
      
    }
    
   
    

  }

  // Handle Change 
  const HandleChange = (event) =>{
    const id = event.target.id 
    const file = event.target.files[0];
    if (file) {
      
      ChangePhotoFile(file)
      const Reader = new FileReader()
      Reader.onload = () => {
        
        ChangePhotoUrl(Reader.result)
       
      }

      Reader.readAsDataURL(file)
      document.getElementById("PreviewPhoto").style.display = 'flex'

     }
   
   
  
  }
  // Upload Photo And Video 
  const UploadPhotoVideo = (event) =>{
    const id = event.target.id 
    if (id == 'Photo'){
      const innervalue = document.getElementById("Photo").innerHTML
     if (innervalue != 'Cancel ❌'){
      document.getElementById("UploadPhoto").click()
      document.getElementById("Photo").innerHTML = 'Cancel ❌'
     }
     else {
      document.getElementById("PreviewPhoto").style.display = 'none'
      document.getElementById("Photo").innerHTML = 'Photo 📸'
     }
    }
  }
  // Chat Componet 
  const Chat = (props) =>{
    const Status = props.id == UserDetails.id 

    if (Status == true){
      return (
        <div className ='mt-6 '>
          <div className = 'w-80 flex relative flex-col shadow  border-l-2 border-l-blue-500 flex flec-col '>
            <label className = 'ml-6 text-md'>Me</label>
            <p className = 'text-xs mt-3 p-3   ml-3 whitespace-pre-line break-all w-full'>{props.Chat}</p>
            {props.Photo !=  ''  && <div className = 'relative h-80 mb-6 border shadow  w-80'>
              <Image 
              className = 'z-10'
                 src =  {props.Photo}
               layout = 'fill'
               objectFit = 'contain'
              />
            </div> }
            <label className = 'ml-3 absolute bottom-0 right-2 text-rose-600 text-[10px]'>{props.date}</label>
          </div>
          </div>
      )
    }

    if (Status == false) {
      return (
        <div className ='mt-6'>
        <div className = 'w-80 flex flex-col shadow p-3  border-l-2 border-l-red-500 flex flex-col '>
          <label className = 'ml-6 text-md'>{props.FullName}</label>
          <p className = 'text-xs mt-3 p-3   ml-3 whitespace-pre-line break-all w-full'>{props.Chat}</p>
          <label className = 'ml-3 absolute bottom-0 right-2 text-rose-600 text-[10px]'>{props.date}</label>

        </div>
        </div>
      )
    }
  }
    return (
      <div className = 'flex  flex-col items-center justify-center'>
       
        <div className = ' flex z-30   fixed bg-white py-2 top-0 border-b w-full flex-col items-center justify-center '>
        <button className = 'absolute px-3 py-2 border border-black rounded top-2 left-2 '>
          Back
        </button>
        <h1 className = 'text-2xl  '>Skillshub📝</h1>
          <button className = 'text-xl mt-3'>{UserDetails.FullName}</button>
           <strong className = 'text-sm text-green-600'>🟢 Online</strong>
           <label>Typing...</label>
        </div>

        <div className = 'mt-48 mb-48'>

         {Chats.map((data)=><Chat id = {data.id} Photo={data.Photo} FullName = {data.FullName} Chat = {data.Chat} date = {data.date} />)}
         <label id = 'BringUp'></label>
        </div>
       
         

       
        <div className = 'fixed z-20 bg-white shadow-lg w-80  bottom-6 p-3 flex flex-col gap-3 border rounded items-center justify-center'>
        
          <div className = 'flex items-center justify-center'>
          <textarea id = "Chat" className = 'items-center border-b border-b-black  h-auto p-3 outline-none justify-center flex' placeholder = 'Text Anything' type = 'text' />
          <button onClick= {Send} className ='border rounded text-white bg-green-600 px-3 py-2'>Send</button>
          </div>
          <div className = 'flex self-start gap-3 ml-3'>
          <button onClick = {UploadPhotoVideo} id = "Photo" className = 'border text-xs   px-3 py-2 rounded shadow-button'>Photo 📸</button>
          <button className = 'border px-3 py-2 shadow-button text-xs rounded'>Video 📹</button>
         </div>
         <input onChange = {HandleChange} id = "UploadPhoto" accept="image/*" type = 'file' className = 'hidden' />
         <input id = "UploadVideo" accept = 'video/*' type = 'file' className = 'hidden'/>
         <div  className = 'relative hidden border  shadow-lg w-80 h-80' id = "PreviewPhoto">
          <Image className = 'z-20' layout = 'fill' objectFit = 'contain' src ={PhotoUrl} />
         </div>
           </div>
      </div>
    )
}
export default Page 