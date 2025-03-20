'use client'
import { getSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { VscArrowCircleLeft } from "react-icons/vsc";
import {db} from './firebase'
import { doc, onSnapshot } from "firebase/firestore";
import Image from 'next/image'
import {useState,useEffect} from 'react'
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Footer from "@/app/footer"
const Page = ({Responsefromserver}) =>{
  const params = useParams()
  const [UserDetails,ChangeUserDetails] = useState({})
  const [Receiver,ChangeReceiver] = useState({FullName:''})
  const [VideoUrl,ChangeVideoUrl] = useState('')
  const [PhotoFile,ChangePhotoFile] = useState(undefined)
  const [VideoFile,ChangeVideoFile] = useState(undefined)
  const [PhotoUrl,ChangePhotoUrl] = useState('')
  const Router = useRouter()
  const [Chats,ChangeChats] = useState(Responsefromserver.Data.Chat)
  const session = getSession()
  // Function To Check Authication 
  const CheckAuth = async() =>{
    const Session = await session 
    if (Session != undefined){
      const id = Session.user.id 
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
      const Response = await Request.json()
      if (Response.status == true){
        ChangeUserDetails(Response.Details)
        if (id == Responsefromserver.Data.User1){
          const Requestforuser2 = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${Responsefromserver.Data.User2}`)
          const Responseforuser2 = await Requestforuser2.json()
          ChangeReceiver(Responseforuser2.Details)
        }
        if (id == Responsefromserver.Data.User2){
          const Requestforuser1 = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${Responsefromserver.Data.User1}`)
          const Responseforuser1 = await Requestforuser1.json()
          ChangeReceiver(Responseforuser1.Details)
        }
      }
      if (Response.status == false){
        Router.push("/")
      }
    }
    if (Session == undefined){
      Router.push('/')
    }
  }

   // Live Subscription for listening to live changes in chat 
   const listeningchat = async() =>{

   }

  //UseEffect to CheckAuth 
  useEffect(()=>{
    CheckAuth()
    
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
       
      
  // Function to Generate Random ID 
  const GenerateRandom = () =>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
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
      // Part To Generate Random ID in order to help in Deleting 
      const idofchat = GenerateRandom()

      const Details = {
        idofchat:idofchat,
        id :UserDetails.id ,
        FullName:UserDetails.FullName,
        Chat : value ,
        Photo:UploadableURLPhoto,
        date:datestring
      }
      
      const newarr = [...Chats,Details]
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SendChat`,{
        method:"POST",
        headers:{"Content-Type":'application/json'},
        body:JSON.stringify({id : params.id ,chat:newarr})
      })
      const Response = await Request.json()
      if (Response.status == true){
        ChangeChats(newarr)
      }
      
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
  // Function to Delete Chat from Databse

  // Chat Componet 
  const Chat = (props) =>{
    const Status = props.id == UserDetails.id 

    // Function to Delete the Chat 
    const Deleteforeveryone = async() =>{
      const id = props.idofchat 
      const newarr = Chats.filter((data)=>{
        if (id != data.idofchat){
          return data
        }
      })
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteChat`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:params.id,arr:newarr})
      })
      const Response = await Request.json()
      if (Response.status == true){
        ChangeChats(newarr)
      }

    }
      return (
        <div className ='mt-9  '>
          <div className = 'w-80 py-2  shadow-lg flex relative flex-col shadow  border-l-2 border-l-blue-500 flex flec-col '>
            <label className = 'ml-6 text-md'>{Status && <>Me </>} {!Status && <>{Receiver.FullName}</>}</label>
            <p className = 'text-xs mt-3 p-3   ml-3 whitespace-pre-line break-all w-full'>{props.Chat}</p>
            {props.Photo !=  ''  && <div className = 'relative h-80 mb-6   w-80'>
              <Image 
              className = 'z-10'
                 src =  {props.Photo}
               layout = 'fill'
               objectFit = 'contain'
              />
            </div> }
            <label className = 'ml-3 absolute bottom-0 right-2 text-rose-600 text-[10px]'>{props.date}</label>
          </div>
         {Status && <button onClick = {Deleteforeveryone} id = {props.idofchat} className = 'text-rose-600 text-xs'>Delete for everyone</button>} 
          </div>
      )
    

    
  }
    return (
      <div className = 'flex  flex-col items-center justify-center'>
       
        <div className = ' flex z-30   fixed bg-white py-2 top-0 border-b w-full flex-col items-center justify-center '>
        <button className = 'absolute  flex items-center justify-center   top-2 left-2 '>
         <VscArrowCircleLeft size = {30}/> Back
        </button>
        <h1 className = 'text-2xl  '>Skillshub📝</h1>
          <button className = 'text-xl mt-3'>{Receiver.FullName}</button>
           <strong className = 'text-sm text-green-600'>🟢 Online</strong>
           <label>Typing...</label>
        </div>

        <div className = 'mt-48 mb-96'>

         {Chats.map((data)=><Chat idofchat = {data.idofchat} id = {data.id} Photo={data.Photo} FullName = {data.FullName} Chat = {data.Chat} date = {data.date} />)}
         <label id = 'BringUp'></label>
        </div>
       
         

       
        <div className = 'fixed z-20 bg-white shadow-lg w-80  bottom-3 p-3 flex flex-col gap-3 border rounded items-center justify-center'>
        
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