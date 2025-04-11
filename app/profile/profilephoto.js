"use client"
import Image from "next/image";

import useStore from "./[id]/usestore";
import {storage} from './firestore(image)'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getSession } from "next-auth/react";
import { useEffect,useState } from "react";
import { useParams } from "next/navigation";




const ProfilePhotoUpload = (props) => {
  const Details = props.data
  const params = useParams()
  console.log(Details)
  const [image, setImage] = useState(''||Details.ImgSrc);
  const [text,changetext] = useState("Preview 🗾")
  



   // Function To Upload Image and Get ImgSrc 
   const UploadImg = async(UploadableFile)=>{
    const storageref = ref(storage,`photos/${UploadableFile.name}`)
    
    await uploadBytes(storageref,UploadableFile)
    const url = await getDownloadURL(storageref)
    return url 
 }

  // For local file preview
 
  const handleImageChange = async(e) => {
    const file = e.target.files[0];
    if (file) {
      // This Part Stores the image in the local storage
     const Reader = new FileReader()
     Reader.onload = () => setImage(Reader.result)
     Reader.readAsDataURL(file)
     setTimeout(()=>{
      document.getElementById("alertforimage").style.display = 'none'
     },8000)
     
     const url = await UploadImg(file) 
     const Session = await getSession() 
     const session = await Session
     const id = session.user.id
    
     if (id == params.id)  {
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/ChangeProfileImage`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ImgSrc:url,id:params.id})
       })
       const Response = await Request.json()
     }
     


    }
  };
  const handlelclick  = () =>{
   document.getElementById("file-upload").click()
  }

// Function To Preview The Profile Photo 
const Preview = () =>{
  if (text == 'hide ⏪'){
    document.getElementById("uploadable").style.display = 'flex'
    document.getElementById("nonuploadable").style.display = 'none'
    changetext('Preview 🗾')
    return 0
  }
  if (text == 'Preview 🗾'){
    document.getElementById("uploadable").style.display = 'none'
    document.getElementById("nonuploadable").style.display = 'flex'
    changetext('hide ⏪')
    return 0
  }
}
  return (
    <div className="flex flex-col px-12  items-center">
      <div id = "uploadable" className="relative w-80 mt-6 mb-6 h-80">
        {/* Profile Image Container */}
       
          
            <Image
              src={image}
              alt="Profile"
              layout="fill"
              objectFit="scale-down"
              
              className = 'shadow-lg '
            />
        
           
       
        
         
       
        <input
          
           
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        
      </div>
      <h1 className = 'text-2xl mb-6'>{Details.FullName}</h1>
     {props.Authenticate && <button onClick={handlelclick} className="bg-black text-white px-4 py-2 rounded-lg">Upload</button>}
     <p id = "alertforimage" className = 'hidden items-center justify-center border px-2 py-2  mt-6 bg-green-400 rounded-lg  text-xs'>Please Check Your Email To Complete Change Procedure</p>
      
    </div>
  );
};

export default ProfilePhotoUpload;
