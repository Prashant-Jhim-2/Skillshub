'use client'
import { VscArrowCircleLeft } from "react-icons/vsc";
import { MdOutlineQuestionAnswer } from "react-icons/md";
import Image from "next/image";
import Card from './Card'
const Page = () =>{
  return(
    <div className = 'flex  items-center flex-col'>
      <button className = 'fixed top-2 left-2 flex items-center'>
      <VscArrowCircleLeft size={30} /> Back
      </button>

      <h1 className = 'w-screen text-center py-12 text-2xl'>SkillsHub📝</h1>

      <div className = 'flex w-full items-center flex-col'>

      <div className = 'relative w-[300px] h-[300px] '>
        <Image 
        src = "https://unsplash.com/photos/5dahujbrfX4/download?ixid=M3wxMjA3fDB8MXxhbGx8MTZ8fHx8fHx8fDE3MzYwNDA2NDl8&force=true"
        layout = 'fill'
        objectFit = 'cover'
        className = 'shadow-lg'
        />
      </div>

      <div className = 'flex items-center flex-col  '>
        <h1 className = 'text-3xl px-2 mt-3 ' >Machine Learning </h1>
        <p className = 'px-2 text-sm mt-3'>This Course Will Introduce The Student About Machine Learning it is foucs on python</p>
        <button className = 'flex gap-3 items-center border mt-6 border-black px-3 py-2 rounded-lg'><MdOutlineQuestionAnswer size={20}/>Ask Professor</button>
         <h1 className = 'mt-6 ml-3 mb-6'>Course Content</h1>
         <Card/>
      </div>
      </div>
   
   
   
    </div>
  )
}
export default Page 