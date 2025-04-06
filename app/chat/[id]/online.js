'use client'
import {db} from '@/app/firebase'
import { VscArrowCircleLeft } from "react-icons/vsc";

import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect,useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Component to Tell Database whether user is online or not by last seen
const Page = (props) =>{
  var unsubscribe
  var timeout 
  console.log(props)
    const [Online,changestatus] = useState(false)
  const session =  getSession()
  const Router = useRouter()
    

   

    // Function to GoBack to Chats Page 
 
    return (
        <div className = ' flex z-30   fixed bg-white py-2 top-0 border-b w-full flex-col items-center justify-center '>
         </div>
    )
}
export default Page 