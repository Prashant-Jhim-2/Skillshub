'use client'
import Image from "next/image"
import ReactPlayer from "react-player"
import {useState,useRef,useEffect} from 'react'
import { MdOutlineFileUpload } from "react-icons/md"
import { CgProfile } from "react-icons/cg";;
import { VscArrowCircleLeft } from "react-icons/vsc";
import { AiOutlineDelete } from "react-icons/ai";
import { TbBookUpload } from "react-icons/tb";
import { MdOutlineCloudUpload } from "react-icons/md";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { GrChapterPrevious } from "react-icons/gr";
import { GrChapterNext } from "react-icons/gr";
import { CiPlay1 } from "react-icons/ci";
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytesResumable,uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from "next/link";
import { getSession } from "next-auth/react"


const Page = ({data}) =>{
  const Session = getSession()
  const [enabled, setEnabled] = useState(false);
  const [Posttext,ChangePostText] = useState('Upload')
  const [EditDisplay,ChangeEditDisplay] = useState('hidden')
  const [Savingtext,changesavingtext] = useState('Save Changes ✅')
  const [animateenable, setAnimateEnabled] = useState(false);
  // State to Store data of course or changes in it 
  const [CourseName,CourseNameChange] = useState(data.Details.Name)
  const [Description,ChangeDescription] = useState(data.Details.Description)
  const [CourseImg,ChangeCourseImg] = useState(data.Details.ImgSrc)
  const [Content,ChangeContent] = useState(data.videos)
  const [progress,ChangeProgress] = useState(0)
  const [VideoPlayerDisplay,ChangeVideoPlayerDisplay] = useState('hidden')
  const [VideoPlayerSrc,ChangeVideoPlayerSrc] = useState({Name:undefined,Src:undefined,Index:undefined})

  // State to Store The Data
 // Ref for Video Duration 
const VideoRef =  useRef(null)
  // Temporary Storage for Video and Image 
  const [TempImg,ChangeTempImg] = useState(undefined)
  const [TempVideo,ChangeTempVideo] = useState(undefined)
  const [UploadableImageFile,ChangeUploadableImageFile] = useState(undefined)
  const [UploadableVideoile,ChangeUploadableVideoFile] = useState(undefined)


  const [Display,ChangeDisplay] = useState('hidden')
  const [ProfessorData,ChangeProfessorData] = useState({FullName:"",ImgSrc:"",id:""})
  
  console.log(enabled)


  // Function to Save The Changes 
  const SaveChanges = async(InputContent) =>{
     console.log(InputContent)
     changesavingtext('Saving...🚗')
     setAnimateEnabled(true)
     var ImgSrc  
     if (UploadableImageFile != undefined){
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
        // Function To Upload Image and Get ImgSrc 
        const UploadImg = async()=>{
         const storageref = ref(storage,`photos/${UploadableImageFile.name}`)
         await uploadBytes(storageref,UploadableImageFile)
         const url = await getDownloadURL(storageref)
         return url 
               }

      ImgSrc = await UploadImg()
      
     }
     if (UploadableImageFile == undefined ){
      ImgSrc = CourseImg
  }

  const Details = {
    Name : CourseName,
    Description:Description,
    ImgSrc:ImgSrc,
    Content:InputContent || Content
  }
  const id = data.Details.id 
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/UpdateCard`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({id,data:Details})
  })
  const Response = await Request.json()
   if (Response.status == true){
    setTimeout(()=>{
      changesavingtext('Save Changes ✅')
      setAnimateEnabled(false)
      setEnabled(false)
     
    },2000)
   }
}


// Function to Check if User is Professor or not
const CheckUser = async() =>{
  const session = await Session 
  if (session != undefined){
    const id = session.user.id 
    if (id == data.Details.ProfessorId){
      ChangeEditDisplay('flex')
    }
  }
}

const HandleTextChange = (event)=>{
  const id = event.target.id 
 
  if (id == 'CourseName'){
    CourseNameChange(event.target.innerText)
  }
  if (id == 'Description'){
    ChangeDescription(event.target.innerText)
  }
}


  const VideoCard = (props)=>{
    const [DeleteText,ChangeDeleteText] = useState("Delete")
// Function to Delete Video Card 
const DeleteVideoCard = async()=>{
  ChangeDeleteText('Deleting..')
  const NewContent = Content.filter((data)=>{
    if (data.Index != props.Index){
      return data 
    }
  })
  const updated = []
  for (let i = 0 ; i < NewContent.length ; i++){
    const content = {
      Name: NewContent[i].Name,
      PublicID: NewContent[i].PublicID,
      Index: NewContent[i].Index, 
      Duration : NewContent[i].Duration,
      No : i
    }
    updated.push(content)
  }

 
  

  setTimeout(()=>{
    SaveChanges(updated)
    ChangeContent(updated)
    ChangeDeleteText('Delete')
  },2000)
  
}

// function use public id to create a signed url
const GetSignedUrl = async() =>{
  const newurl = `/api/signedurl?public_id=${props.PublicID}`
  ChangeVideoPlayerSrc({Name:props.Name,Src:newurl,Index:props.Index,No:props.No})
  ChangeVideoPlayerDisplay('flex')
}
   
 
    return (
      <div className="flex flex-col border shadow-lg p-3 w-full justify-start">
        <h1 className="text-lg">{props.Name}</h1>
        <label className="text-xs">Duration : {props.Duration} min</label>
        <button onClick={GetSignedUrl} className="border mt-3 w-24 active:bg-white active:text-black active:border-black flex gap-2 text-sm items-center justify-center shadow-lg rounded-lg py-2 px-3 bg-black text-white">Play  <CiPlay1 size = {20} /></button>
        {EditDisplay == 'flex' &&  <button onClick={DeleteVideoCard} className="border text-sm flex gap-2 items-center justify-center w-24 p-2 mt-3 rounded bg-rose-600 shadow-lg active:border-rose-600 active:bg-white active:text-black text-white">{DeleteText} <AiOutlineDelete size={18} /></button>}
      </div>
    )
  }

  // Function to Retrieve the data of course 
  const FetchData = async() =>{
    const id = data.Details.ProfessorId 
    // Part to Fetch Professor Data 
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
    const Response = await Request.json()
    console.log(Response)
    if (Response.status == true){
      const Details = Response.Details 
      console.log(Details)
     
      ChangeProfessorData(Details)
    }

  }

  

  // Function to Open uploadwindow or close it 
  const OpenorClose = () =>{
    if (Display == 'flex'){
    ChangeDisplay('hidden')
      return 0
    }
    if (Display == "hidden"){
      ChangeDisplay('flex')
       return 0
    }
  }
  // Handle Video Upload 
  const handleVideoChange = async(event) =>{
    ChangePostText('Uploading...')
    document.getElementById('Uploadbutton').disabled = true
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onloadend = async()=>{
        const base64file = reader.result 
        const res = await fetch('/api/upload',{
          method:'POST',
          body:JSON.stringify({file:base64file}),
          headers:{
            'Content-Type':'application/json'
          }
        })
        const data = await res.json();
        setTimeout(()=>{
          ChangeTempVideo({
            url:data.secure_url,
            public_id:data.public_id
          })
          document.getElementById('Uploadbutton').disabled = false 
          ChangePostText('Upload')
        },2000)
      }
  
      
    }}
  //Function to Upload Image or Video 
  const handleImageChange = async(event) =>{
    const file = event.target.files[0];
        if (file) {
         ChangeUploadableImageFile(file)
         const Reader = new FileReader()
         Reader.onload = () => ChangeTempImg(Reader.result)

         Reader.readAsDataURL(file)
   
  }
}

// Function to Open Video Player 
const OpenPlayer = ()=>{
 if (VideoPlayerDisplay == 'hidden' && VideoPlayerSrc != undefined){
  ChangeVideoPlayerDisplay('flex')
  return 0
 }
 if (VideoPlayerDisplay == 'flex'){
  ChangeVideoPlayerDisplay('hidden')
  return 0
 }
}

// Random Upload ID Generator 
const GenerateRandomId = () =>{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "" 
  for (let i = 0 ;  i <=16 ; i++){
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result 
}
// Function to Upload Video
const UploadVideo = async() =>{
  if (TempVideo != undefined){
    
  
  var VideoSrc = TempVideo.url 
  const Duration = VideoRef.current.getDuration()
  const mins = Math.floor(Duration / 60);
  const seconds = Math.floor(Duration % 60);
  const formattedDuration = `${mins}:${seconds < 10 ? '0' : ''}${seconds}`;

  const Details = {
    Name :document.getElementById('VideoName').value,
    Index : GenerateRandomId(),
    Duration:formattedDuration,
    PublicID:TempVideo.public_id,
  }

  const NewVideoArr = [...Content,Details]
  console.log(NewVideoArr)
  const Detailsforshow = {
    ...Details,
    No:Content.length
  }
  const arrforshow = [...Content,Detailsforshow]
  ChangeContent(arrforshow)


  setTimeout(()=>{ 
    SaveChanges(NewVideoArr)
    ChangeProgress(0)
    OpenorClose()
    document.getElementById('VideoName').value = ''
    ChangeTempVideo(undefined)
    
   
  },2000)
  alert("Video Has been Uploaded")
  
}
if (TempVideo== undefined){
  alert('Please Upload Video')
}}

  
  useEffect(()=>{
    FetchData()
    CheckUser()
  },[])
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-xl ">Skillshub📝</h1>
      <label className="text-xs">Courses</label>
      {enabled &&  <div className={`flex ${animateenable && 'animate-glow'} z-50 fixed top-12 bg-white p-3 border gap-2 mt-3`}>
        <button onClick={()=>{
          SaveChanges()
        }} className="bg-green-600 active:bg-white active:text-green-600 active:border-green-600 active:font-bold border text-white px-4 py-2  rounded">{Savingtext}</button>
       
      </div>}
      <Link href = '/home'>
      <button className="fixed flex   gap-2 items-center justify-center top-2 left-2 active:text-rose-600"><VscArrowCircleLeft size = {20}/>Back</button>
      </Link>
     
      <Image  className="mt-24 shadow-lg border" src = {TempImg || data.Details.ImgSrc} width={250} height = {250} />
     {enabled && <> <button onClick = {()=>{
      document.getElementById('ImgUpload').click()
     }} className="bg-black text-white py-2 px-3 shadow-lg mb-6 mt-2 active:bg-white active:text-black active:border active:font-bold active:border-black active:border-2 rounded-lg">Upload Image 📸</button>
     <input className="hidden" id = "ImgUpload" onChange={handleImageChange} type ='file' accept="image/*" />
     </> }
     { enabled && <label className=" text-xs">Course Name</label>}
      <h1 onInput={HandleTextChange} id = "CourseName" contentEditable = {enabled}  className={`text-lg ${enabled && 'border outline-black rounded p-3 border-gray-400'}`}>{data.Details.Name}</h1>
      <h2  className="mt-9 font-bold">Description</h2>
      <label  id = "Description" onInput={HandleTextChange} contentEditable = {enabled} className= {`w-80 text-center mb-12 ${enabled && ' border border-gray-400 outline-black rounded p-3'}`}>{data.Details.Description}</label>



     <div id = "VideoPlayer" className={`fixed top-0 gap-2 pt-3 bg-white ${VideoPlayerDisplay} flex-col items-center justify-center  w-full h-full`}> 
      <button className="border flex active:border active:bg-white active:text-black gap-2 shadow-lg border-black p-2 text-sm bg-black text-white rounded" onClick={OpenPlayer}>Close Player <IoMdCloseCircleOutline size={20}/> </button>
      <h1 className='font-bold'>{VideoPlayerSrc.Name}</h1>
      <ReactPlayer
     
      url = {VideoPlayerSrc.Src}
      width='70%'
      height='70%'
  
      controls
        className = 'shadow-lg'
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true
            },
          },
        }}
      
      />
   

       
      <div className = 'flex gap-14 mb-24 mt-3'>
        {VideoPlayerSrc.No > 0  &&  <button onClick={()=>{
          const NewIndex = VideoPlayerSrc.No -1 
          if (NewIndex >= 0){
            const NewSrc = Content[NewIndex] 
            ChangeVideoPlayerSrc({Name:NewSrc.Name,Src:`/api/signedurl?public_id=${NewSrc.PublicID}`,Index:NewSrc.Index, No:NewSrc.No})
          }
        }} className="border flex gap-2 items-center shadow-lg active:text-black active:bg-white  justify-center border-black bg-black text-white p-2 rounded"><GrChapterPrevious size={15} />Prev </button>}
        {VideoPlayerSrc.No < Content.length - 1 && <button className="border active:bg-white shadow-lg active:text-black flex gap-2 items-center justify-center border-black bg-black text-white p-2 rounded-lg"  onClick={()=>{
          const NewIndex = VideoPlayerSrc.No + 1 
          if (NewIndex < Content.length){
            const NewSrc = Content[NewIndex] 
            ChangeVideoPlayerSrc({Name:NewSrc.Name,Src:`/api/signedurl?public_id=${NewSrc.PublicID}`,Index:NewSrc.Index, No:NewSrc.No})
          }

        }}>Next <GrChapterNext size = {15} /></button>}
      </div>
     </div>


      <div id  = "UploadWindow" className={`w-full h-full overflow-scroll pb-24 ${Display} flex-col items-center bg-white top-0 border-black fixed border  z-60  `}>
        <h1 className="text-2xl mt-6">Skillshub📝</h1>
        <h1 className="text-sm ">Upload Content</h1>
        
        <h1 className="mt-12 mb-3 text-xl ">Hi <strong className="text-red-600">{ProfessorData.FullName}</strong> </h1>
        {TempVideo != undefined  && 
        <ReactPlayer 
        ref = {VideoRef}
        url = {TempVideo.url || `https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/file%2F1737315735007-RPReplay_Final1707163746.MP4?alt=media&token=c5e0a63c-ce44-4932-a44b-a7a32326e9e8`}
        width='90%'
        height='90%'
        controls
        className = 'shadow-lg'
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true
            },
          },
        }}
        
        />}

       
        <label className="mt-12 ">Name of Video</label>
        <input id = "VideoName" className="w-64 rounded border-2 border-black h-12 p-3" type = 'text' placeholder="Enter The Name " />
       
        <input className="hidden" id = "VideoUpload" onChange={handleVideoChange} type ='file' accept="video/*"/>
        <button id = "Uploadbutton" onClick={()=>{
          document.getElementById('VideoUpload').click()
        }} className="border flex gap-2 active:bg-black active:text-white items-center justify-center border-black p-3 mt-6 rounded shadow-lg font-bold">{Posttext} <MdOutlineCloudUpload size = {25} /> </button>
       
       <label className="text-xs mt-4 border border-black bg-yellow-400 p-3 rounded text-grey-500">Notice : All Videos will be converted to MP4 format</label>
        {progress > 0 && <strong className="text-green-500">Posting[ {progress}% ]</strong>}
        <button onClick={UploadVideo} className="px-4 py-2 flex items-center gap-2 justify-center rounded mt-12 border bg-black text-white">Post <TbBookUpload size = {25} /></button>
        <label className="mt-3 mb-3">OR</label>
       
        <button onClick={OpenorClose} className="text-white shadow-lg bg-rose-600  p-3 rounded active:bg-white active:text-black active:font-bold active:border active:border-black">Cancel</button>
      </div>






    

      <label className="font-bold mt-3">Professor</label>
      <div className="border shadow-lg rounded-lg  w-80 flex items-start justify-start gap-2 p-3">
        <Image className="rounded-[150px] h-24" src = {ProfessorData.ImgSrc} width={100} height={100} />

        <div className="flex  flex-col">
        <h2 >{ProfessorData.FullName}</h2>
        <Link href = {`/profile/${ProfessorData.id}`}>
        <button className="bg-black  active:bg-white active:text-black active:border-black flex items-center justify-center gap-2 border shadow-lg text-white px-3 py-2 rounded mt-3">View Profile<CgProfile size ={20} /></button></Link>
        </div>
      </div>
      <button onClick={OpenorClose} className={`mt-12         ${EditDisplay}    items-center justify-center gap-2 border px-3 py-2 bg-black text-white rounded-lg active:bg-white active:text-black  shadow-lg active:border-black`}>Upload Content  <MdOutlineFileUpload size={30} /></button>
      <div className={`fixed top-2  right-2 ${EditDisplay} gap-2 items-center justify-center`}>
      <label>Edit</label>
      <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >

      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  
      </div>
     
      <label className="mt-12 mb-3 font-bold">Course Content</label>
    

     
    {Content.length == 0 && <div className="w-80 flex   flex-col gap-4 items-center justify-center">
        <Image src = '/empty.png' width = {100} height={100} />
       <h2 className="text-xl">No Content Uploaded 🚫</h2>
      </div>}

    {Content.length != 0 && <div className="w-80 flex flex-col gap-3 items-center justify-center">
      {Content.map((data)=>{
        if (data != undefined){
          return (
            <VideoCard No = {data.No} Name = {data.Name} Duration = {data.Duration} PublicID={data.PublicID} Index = {data.Index} />
          )
        }
      })}
      </div>}
    </div>
  )
}
export default Page 
