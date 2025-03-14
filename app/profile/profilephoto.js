import React, { useState } from "react";
import Image from "next/image";
import { useRef } from "react";
import useStore from "./[id]/usestore";

const ProfilePhotoUpload = (props) => {
  const ref = useRef(null)
  const Details = props.data
  console.log(Details)
  const [image, setImage] = useState(''||Details.ImgSrc);
  const [text,changetext] = useState("Preview 🗾")
  
  // For local file preview
 
  const handleImageChange = (e) => {
    document.getElementById("alertforimage").style.display = 'flex'
    const file = e.target.files[0];
    if (file) {
     const Reader = new FileReader()
     Reader.onload = () => setImage(Reader.result)
     Reader.readAsDataURL(file)
     setTimeout(()=>{
      document.getElementById("alertforimage").style.display = 'none'
     },8000)

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
      <h1 className = 'text-2xl mb-6'>Prashant Kumar</h1>
      <button onClick={handlelclick}   className ='border border-black px-4 py-2 rounded-lg text-white bg-black transition duration-200 active:translate-y-1'>Upload</button>
     <p id = "alertforimage" className = 'hidden items-center justify-center border px-2 py-2  mt-6 bg-green-400 rounded-lg  text-xs'>Please Check Your Email To Complete Change Procedure</p>
      
    </div>
  );
};

export default ProfilePhotoUpload;
