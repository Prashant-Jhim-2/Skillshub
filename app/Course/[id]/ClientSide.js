'use client'
import { VscArrowCircleLeft } from "react-icons/vsc";
import { MdOutlineQuestionAnswer } from "react-icons/md";
import Image from "next/image";
import Card from './Card'
import {useState} from 'react'
import { GoVideo } from "react-icons/go";
import { CiImageOn } from "react-icons/ci";
import ReactPlayer from "react-player";
import { GrInProgress } from "react-icons/gr";
import { FiUpload } from "react-icons/fi";
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useParams, useRouter } from "next/navigation";

const Page = ({data}) =>{
 const Router = useRouter()
 const params = useParams()
 const [Videos,ChangeVideos] = useState(data.videos)

 const id = params.id 


const GoBack = () =>{
  Router.push('/courses/' + id)
}
// Function To Again Fetch The Card after New Upload
const RefreshFetch = async() =>{
   // Fetch To Get Videos 
   const RequestforVideos = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetVideos/${id}`)
   const ResponseforVideos = await RequestforVideos.json()
   const arrofvideos = ResponseforVideos.data 
   ChangeVideos(arrofvideos)
}
 
 const View = () =>{
 const [videosrc,changevideosrc] = useState('https://youtu.be/uChhQpHMmXE')
 const [imgsrc,changeimgsrc] = useState('https://images8.alphacoders.com/132/thumb-350-1329815.webp') 
 const [VideoFile,ChangeVideoFile] = useState(undefined)
  const [ImageFile,ChangeImageFile] = useState(undefined)
  const [playing, setPlaying] = useState(false);
  const [Scene,ChangeScene] = useState(false)
  const [ImageProgress,ChangeImageProgress] = useState("")
  const [VideoProgress,ChangeVideoProgress] = useState('')
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      const id = event.target.id 
      const URLofFile = URL.createObjectURL(file);
      if (file && id == "uploadvideo") {
        ChangeVideoFile(file)
        changevideosrc(URLofFile);
      }
      if (file && id == 'uploadimg'){
        ChangeImageFile(file)
        changeimgsrc(URLofFile)
      }
      
    };

    const ChangeView = () =>{
      const PrevScene = Scene 
      if (PrevScene == true){
        ChangeScene(false)
        return 0
      }
      if (PrevScene == false){
        ChangeScene(true)
        return 0
      }
    }

    
    const click = (event) =>{
      if (event.target.id == "VideoUpload") {
      document.getElementById("uploadvideo").click()
      }
      if (event.target.id == "ImageUpload"){
        document.getElementById("uploadimg").click() 
      }
     
      }

    // Function To Post Video Onto Database
    const PostVideo = async() =>{
      document.getElementById("Posting").style.display = 'flex'
      document.getElementById("Post").disabled = true
      // Part Of Uploading file 
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
      const UploadFilee = async(File,Type)=>{
        
        if (File != undefined){
          const uniqueName = `${Date.now()}-${File.name}`;
          const storageRef = ref(storage,`file/${uniqueName}`)
          const uploadTask = uploadBytesResumable(storageRef, File);

          return new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (Type === "Video") {
                  ChangeVideoProgress(`${progress.toFixed(2)} %`);
                }
                if (Type === "Image") {
                  ChangeImageProgress(`${progress.toFixed(2)} %`);
                }
              },
              (error) => {
                console.error("Upload failed:", error);
                reject(error); // Reject the promise if there's an error
              },
              async () => {
                // Upload completed successfully
                try {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(url); // Resolve the promise with the download URL
                } catch (error) {
                  console.error("Failed to get download URL:", error);
                  reject(error);
                }
              }
            );
          });
          
        }
        
        return undefined 
     }
     console.log(ImageFile,VideoFile)
    const urlofvideo = await UploadFilee(VideoFile,'Video')
    const urlofthumbnail = await UploadFilee(ImageFile,'Image')
    const Details = {
      Name : document.getElementById("Name").value ,
      Description : document.getElementById("Desc").value ,
      urlofvideo: urlofvideo,
      CourseID : data.CourseID,
      urlofThumbnail : urlofthumbnail
    }
    console.log(Details)
    
    if (Details.Name != '' && Details.Description != '' && Details.urlofvideo != undefined){
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Video`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(Details)
      })
      const Response = await Request.json()
      console.log(Response)
      if (Response.status == true){
        document.getElementById("Posting").style.display = 'none'
        ChangeScene(false)
        RefreshFetch()
        
      }
    }
    }
    
    if (Scene == true){
      return (
        <div className = 'flex flex-col mt-6 mb-12 gap-6 items-center justify-center  '>
         <label>Video <strong className = 'text-green-600'>{VideoProgress}</strong></label>
         <input accept="video/mp4" className = 'hidden' id = "uploadvideo" type = 'file' onChange={handleFileChange}/>
         <div className="relative pb-[56.25%] w-[350px] h-0 lg:w-[500px] xl:w-[500px] 2xl:w-[500px] md:w-[400px] sm:w-[350px] xs:w-[350px]">
      <div className="absolute top-0 left-0 w-full h-full">
        <ReactPlayer
          url= {videosrc} // Replace with your video URL
           
          playing={playing}
          controls
          width="100%"
          height="100%"
          className="react-player"
          onClickPreview={() => setPlaying(true)} // Start playing on thumbnail click
        />
      </div>
    </div>
    
    <button id = 'VideoUpload' onClick={click} className = 'px-3 mb-6 py-2 active:bg-white active:text-black rounded bg-black text-white border border-black flex gap-2 items-center justify-center'>Upload a Video <GoVideo size={20} /></button>
    <label>Thumbnail <strong className = 'text-green-600'>{ImageProgress}</strong></label>
    <input accept="image/jpeg" className = 'hidden' id = "uploadimg" type = 'file' onChange={handleFileChange}/>

    <div className = 'relative border shadow w-[350px] h-64'>
     
      <Image 
      src = {imgsrc}
      layout = "fill"
      objectFit = 'contain'
      />
    </div>
    <button id = 'ImageUpload' onClick={click} className = 'px-3 mb-6 py-2 active:bg-white active:text-black rounded bg-black text-white border border-black flex gap-2 items-center justify-center'>Upload a Image <CiImageOn size={20} /></button>

         <div className = 'flex py-12 flex-col'>
         <label>Name : </label>
         <input id = "Name" className = 'px-3 w-80 outline-black py-2 border-b border-b-black' type = 'text' placeholder = "Enter The Name " />
         <label>Description : </label>
         <textarea id = "Desc" className = 'px-3 w-80 outline-black py-2 border border-black h-64'   placeholder = "Enter The Description " />
       <div className = 'flex gap-3 mt-6 items-center justify-center'>
         <button id = "Post" onClick = {PostVideo} className = 'bg-green-500 w-24 px-2 py-2   text-white rounded'>Post</button>
         <button onClick = {ChangeView} className = 'active:text-rose-600'>Cancel</button>
         </div>

         </div>
        </div>
      )
    }
    else {
      return (
        <> 
         <div className = 'flex w-full items-center flex-col'>

<div className = 'relative w-[300px] h-[300px] '>
  <Image 
  src = {data.Details.ImgSrc}
  layout = 'fill'
  objectFit = 'contain'
  className = 'shadow-lg'
  />
</div>

<div className = 'flex items-center flex-col  '>
  <h1 className = 'text-3xl px-2 mt-3 ' >{data.Details.Name}</h1>
  <p className = 'px-2 text-sm mt-3'>{data.Details.Description}</p>
  <button className = 'flex gap-3 items-center border mt-6 border-black px-3 py-2 rounded-lg'><MdOutlineQuestionAnswer size={20}/>Ask Professor</button>
  </div>
</div>
        <button onClick = {ChangeView}  className = ' border border-black px-3 py-2 rounded mt-12 text-white bg-black flex items-center justify-center gap-2'>Upload Content <FiUpload size = {20} /></button>
         <h1 className = 'mt-6 ml-3 mb-6'>Course Content ( {Videos.length} )</h1>
        <div className = 'flex items-center justify-center flex-wrap gap-6'>
        {Videos.map((data)=><Card id = {data.id} urlofThumbnail = {data.urlofThumbnail} urlofvideo = {data.urlofvideo} Name = {data.Name} Description = {data.Description}/>)}

          </div>
        </>
      )
    }
  }
  return(
    <div className = 'flex  items-center flex-col'>
      <button onClick = {GoBack} className = 'fixed top-2 left-2 flex items-center'>
      <VscArrowCircleLeft size={30} /> Back
      </button>
      <h1 id = "Posting" className = 'fixed z-30 top-0 w-full bg-green-600 hidden items-center justify-center px-3 transition-transform duration-500 ease-out animate-slideDown text-white py-2'>Posting.....     <GrInProgress size={20} /></h1>
      <h1 className = 'w-screen text-center py-12 text-2xl'>SkillsHub📝</h1>

      <View/>
   
   
   
    </div>
  )
}
export default Page 