'use client'
import {useState,useEffect} from 'react'
import { passwordStrength } from 'check-password-strength'
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import {signIn} from 'next-auth/react'
const bcryptjs = require("bcryptjs")
const Page = ({Details}) =>{
     const Router = useRouter()
     const [Compare,ChangeCompare] = useState("")
     const [Strength,ChangeStrength] = useState('')
     const [Text,ChangeText] = useState("")
     const [index,ChangeIndex] = useState(0)
     const words = 'Updating...'

     useEffect(()=>{
        if (Details.status == false){
            alert("Link has been Expired ❌")
            Router.push("/")
        }
        if (index < words.length){
           const timeout = setTimeout(()=>{
            if (index == 0){
                ChangeText("")
            }
            ChangeText((prev)=>prev + words[index])
            ChangeIndex(index +1)
           },500)
           return () =>clearTimeout(timeout)
        }
        else {
            ChangeText("-----")
            ChangeIndex(0)
        }
        
     },[index])
    //Function To Compare Both Password is it Same or not 
    const Match = () =>{
        const value1 = document.getElementById("Password").value 
        const value2 = document.getElementById("ConfirmPassword").value 
        console.log(value1 == value2)
        if (value1 != '' && value2 != ''){
            document.getElementById("Comparetext").style.display = 'flex'
            if (value1 == value2){
                ChangeCompare("True")
                document.getElementById("Compare").style.color = 'green'
                return true
            }
            if (value1 != value2){
                ChangeCompare("False")
                document.getElementById("Compare").style.color = 'red'
                return false
            }
        }
        if (value1 == "" && value2 == ''){
            document.getElementById("Comparetext").style.display = 'none'

            return false
        }
        if (value1 == "" || value2 == ''){
            document.getElementById("Comparetext").style.display = 'flex'
            ChangeCompare("False")
            document.getElementById("Compare").style.color = 'red'
            return false
        }
    }

    // Function to Encrypt The Password and Send to Database for changing 
    const Encrypt = async() =>{
        const val1 = PassCheck()
        const val2 = Match()
        const hashed = await bcryptjs.hash(document.getElementById("Password").value ,10)
        if (val1 && val2){
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/ChangePassword`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({Email:Details.Email,Password:hashed})
            })
            const Response = await Request.json()
            if (Response.status == true){
                const Result = await signIn("credentials",{
                    redirect:false,
                    Email:Details.Email ,
                    Password:document.getElementById("Password").value
                  })
                  if (Result?.error){
                    alert("Invalid Email and Password")
                  }
                  else{
                    Router.push('/home')
                  }
            }

        }
    }
    //Function To Check Password Strength 
    const PassCheck = () =>{
        const value = document.getElementById("Password").value
        if (value != ''){
            const status = passwordStrength(value).value
            document.getElementById("PassStrengthtext").style.display = 'flex' 
            ChangeStrength(status)
            if (status == 'Too weak' || status == 'Weak'){
                document.getElementById("PassStrength").style.color = 'red'
               Match()
                return false
            }
            
            if (status == 'Medium'){
                document.getElementById("PassStrength").style.color = 'orange'
                Match()
                return false
            }
            if (status == 'Strong'){
                document.getElementById("PassStrength").style.color = 'green'
                Match()
                return true
            }
        }
        if (value == ""){
            document.getElementById("PassStrengthtext").style.display = 'none'
            return false 

        }
       
    }

    // Variants for animation 
    const divvariants = {
        hidden : {opacity:0 , y:50 },
        visible:{opacity:2 , y:0 ,transition:{duration:3.5}}
    }
    return (
    <div className = 'flex relative flex-col items-center justify-center'>
        <button className = 'fixed top-2 left-2'>Back</button>
        <h1 className = 'text-3xl mt-6'>Skillshub📝</h1>
        <p className = 'text-3xl hidden mt-36 px-2 rounded items-center justify-center flex h-12   animate-blink '>{Text}</p>
         <motion.div
         className = 'w-32 hidden h-32 rounded-full bg-blue-500 '
         variants = {divvariants}
         initial="hidden"
         animate="visible"
         ></motion.div>
        <div className = 'flex  mt-24 flex-col items-center justify-center gap-2'>
            <h1 className = 'text-xl mb-12'>Forget Password ✍️</h1>

            <input onChange= {PassCheck} id = "Password" className = 'border-2 text-center  w-64 border-black  outline-black rounded  h-12' type = 'text' placeholder = 'Enter New Password' />
            <input onChange={Match} id = "ConfirmPassword" className = 'border-2 text-center  w-64  border-black  outline-black rounded h-12' type = 'text' placeholder = "Confirm New Password" />
            <p className = 'hidden' id = "PassStrengthtext">Strength: <strong id = "PassStrength">{Strength}</strong></p>
             <p className = 'hidden' id = "Comparetext">Matched : <strong id = "Compare">{Compare}</strong></p>
            <button className = 'px-3 border py-2 border bg-green-500 shadow-lg text-white rounded' onClick={Encrypt}>Update</button>
        </div>
    </div>)
}
export default Page