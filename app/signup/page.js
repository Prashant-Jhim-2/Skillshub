"use client"
import {useState,useEffect} from 'react'

const validator = require("email-validator")


const Signup = () =>{
    //Function To Change Disabled State of Create Button 
    const [isDisabled,ChangeisDisabled] = useState(false)
    const [hidden,changehidden] = useState('hidden')
    const [count, setCount] = useState(30); // Initialize the countdown value

    // Function To Reset The Page 
    const Reset = () =>{
        ChangeisDisabled(false)
        document.getElementById("EmailConfirmation").style.display='none'
        document.getElementById("CreateButton").innerHTML = "Create Account 📝"
        document.getElementById("CreateButton").style.color = 'black'
        document.getElementById("Email").value = ''
        changehidden("hidden")
    }
    // Function To Create Account and Send Email 
    const CreateAndSend = ( ) =>{
        var status = EmailValidator()
        if (status == true){
        ChangeisDisabled(true)
        document.getElementById("EmailConfirmation").style.display='flex'
        document.getElementById("CreateButton").innerHTML = "Creating...📝"
        document.getElementById("CreateButton").style.color = 'grey'
        setCount(30)
        changehidden("flex")
        }
    }
    // Function To Do Countdown function 
const Countdown = () =>{

    useEffect(() => {
      if (count > 1 ) {
        const timer = setTimeout(() => {
            var currentcount = count - 1 
            if (currentcount == 1){
                Reset()
            }
          setCount(count - 1); // Decrease the count by 1 every second
        }, 1000);
  
        // Cleanup to avoid memory leaks
        return () => clearTimeout(timer);
      }
      
    }, [count]);
  

    return (
        <div id = 'showcountdown' className = {hidden}>
            <h2>This Page will Refreshed in {count} Sec</h2>
        </div>
    )
}

    // Email Validator 
    const EmailValidator = () =>{
        const value = document.getElementById("Email").value 
        const Status = validator.validate(value) 
        console.log(Status)
        if (Status == true){
            document.getElementById("EmailValid").style.display = 'flex'
            document.getElementById("EmailInvalid").style.display = 'none'
            return true
            
        }
        if (Status == false || value == ""){
            document.getElementById("EmailValid").style.display = 'none'
            document.getElementById("EmailExist").style.display = 'none'
            document.getElementById("EmailInvalid").style.display = 'flex'
            return false
        }
        
    }
    return (
        <div className = "flex flex-col relative items-center">
            <title>SkillsHub📝</title>
            <button className = 'text-2xl absolute border-2 border-transparent right-6 top-2  p-3 rounded-lg hover:border-black hover:text-white active:translate-y-1 hover:bg-black active:bg-black active:text-white active:border-black transition duration-200'>Login👨🏻‍💻</button>
           <h1 className = "text-5xl mt-32">SkillsHub📝</h1>
           <p id = "EmailConfirmation" className = 'mt-10 border hidden border-black bg-green-300 p-2 rounded-lg text-xl'>Please Check Email for Verification 📩</p>
           <Countdown />
           <input onChange={EmailValidator} id = "Email" className = 'w-64 mt-28 border-0 border-b-2 text-lg outline-none border-b-black h-12' type = "email" placeholder = "Enter The Email :" />
        
           <ul  className = 'list-disc  p-2 '>
            <li id = "EmailValid" className = 'text-green-600 mt-3 hidden'>Email is Valid ✅</li>
            <li id = "EmailExist" className = 'text-orange-500 mt-3 hidden'>Email Already Exists 🐟</li>
            <li id = "EmailInvalid" className = 'text-red-600 mt-3 hidden'>Email is Not Valid ❌</li>
           </ul>
            <button id = "CreateButton" disabled={isDisabled}  onClick={CreateAndSend} className = 'border transform translate-y-2 shadow-md shadow-black active:bg-black active:text-white active:translate-y-1 transition duration-200 s border-black p-3 rounded-lg mt-12'>Create Account 👾</button>
            <h3 className = 'mt-6 mb-3'>OR</h3>
            <button disabled = {isDisabled} className = 'flex rounded-lg shadow-md   shadow-black active:bg-black active:shadow-gray-500 active:text-white active:translate-y-1 transition duration-200 px-6 py-3 border border-black p-3'>Signup With Google <img className = 'w-6' src = "google.png"/></button>
         
        </div>
    )
}
export default Signup