'use client'
import {useState} from 'react'
import { getSession ,signOut} from 'next-auth/react';
import Head from 'next/head'
import { LuMessagesSquare } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import { Search } from 'lucide-react';

import { IoIosLogOut } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineAddBox } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { TiThMenuOutline } from "react-icons/ti";
import { FaRegWindowClose } from "react-icons/fa";
import { useEffect } from "react"
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdOutlinePayments } from "react-icons/md";
import Card from './Card'

const page = ({carddata}) =>{
    const Router = useRouter()
    
    const [isOpentxt,ChangeisOpentxt] = useState("Menu")
    const [Enrolled,ChangeEnrolled] = useState([])
    const [QueryinCard,ChangeQueryinCard] = useState('')
    const [isOpen, setIsOpen] = useState(false);
    const [Empty,ChangeEmpty] = useState(false) 
    const [Details,ChangeDetails] = useState({FullName:"",ImgSrc:"https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/photos%2F3d-cartoon-character.jpg?alt=media&token=90e0d748-1074-4944-8302-32644c60407c"})
    const session = getSession();
    const [Cards,ChangeCards] = useState([])
    const [MenuBtn,ChangeMenuBtn] = useState(<>Menu <TiThMenuOutline  size={30}/></>)
    

    
     
  
    const CheckAuth = async() =>{
        const data = await session
        
        if (data == undefined){
          Router.push('/')
        }
        if (data != undefined){
            
            const dataofcards = carddata
            document.getElementById("Courses").style.backgroundColor = 'black'
            document.getElementById("Courses").style.color = 'white'
            document.getElementById("Enrolled").style.backgroundColor = 'white'
            document.getElementById("Enrolled").style.color = 'black'
           ChangeCards(dataofcards)
          

           // Part To Get User RealTime Data
           const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${data.user.id}`)
           const Response = await Request.json()
           console.log(Response.Details)
           if (Response.status == true){
            const Type = Response.Details.Type 
            console.log(Type)
            if (Type == "Customer"){
              document.getElementById('AddCourse').style.display = 'none'
            }
            if (Type == "Professor"){
              document.getElementById('BecomeProfessor').style.display = 'none'

            }
            ChangeDetails(Response.Details)
           }
           if (Response.status == false){
            Router.push('/')
           }
        }
    }

    
    console.log(Cards)
    useEffect(()=>{
        CheckAuth()
    },[])

   

   // Function To Get Enrolled Courses 
   const GetEnrolled = async() =>{
    const data = await session
    const id = data.user.id
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolled/${id}`)
    const Response = await Request.json()
    console.log(Response)
    if (Response.status == true){
       const filtered =   Response.data.map((data)=> data.CourseID)
       ChangeEnrolled(filtered)
      }
    if (Response.status == false){
        ChangeEmpty(true)
        ChangeCards([])
    }
    
      
   }
   // Function To Change Cards Arr ( Enrolled or Courses)
   const ChangeCardsArr = (event) =>{
    const id = event.target.id 
    if (id == "Enrolled"){
        document.getElementById("Enrolled").style.backgroundColor = 'black'
        document.getElementById("Enrolled").style.color = 'white'
        document.getElementById("Courses").style.backgroundColor = 'white'
        document.getElementById("Courses").style.color = 'black'
        GetEnrolled()

    }
    if (id == "Courses"){
        document.getElementById("Courses").style.backgroundColor = 'black'
        document.getElementById("Courses").style.color = 'white'
        document.getElementById("Enrolled").style.backgroundColor = 'white'
        document.getElementById("Enrolled").style.color = 'black'
        ChangeCards(carddata)
    }
    
   }

    // Logout Function 
    const Logout = async()=>{
        await signOut({callbackUrl:"/"})
    }
    // Go To Profile Page 
    const GotoProfile = async() =>{
        const data = await session
        Router.push("/profile/" + data.user.id)
    }
   
    // Function To AddCourse 
    const AddCourse = () =>{
       Router.push("/CreateCourse")
    }


   
    // Function To Open And Close Menu
    const OpenOrClose = () =>{
      
        if (isOpen == false){
            setIsOpen(true)
            ChangeisOpentxt("Close")
            ChangeMenuBtn(<>Close <FaRegWindowClose size={30}/> </>)
            return 0
        }
        if (isOpen == true){
            ChangeisOpentxt("Menu")
            setIsOpen(false)
            ChangeMenuBtn(<>Menu <TiThMenuOutline  size={30}/></>)
            return 0
        }
    }
   
   
    const GoToChat = () =>{
      Router.push('/chats')
    }

    const GoToBecProfessor = ()=>{
      Router.push("/BecomeProfessor")
    }
    const GotoPurchases = () =>{
      Router.push("/purchases")
    }
    return (
      <div className="flex relative flex-col items-center">
        <title>SkillsHub📝</title>
        <div className="fixed z-20 shadow-sm bg-white p-4 flex w-full">
          <h1 className="text-2xl">SkillsHub📝</h1>
          <button onClick={OpenOrClose} className="fixed flex gap-3 z-12 top-2 p-3 text-lg right-2">{MenuBtn}</button>
        </div>

        <div className="relative">
          <div
            className={`fixed z-20 top-[60px] border-0 border-t flex flex-col gap-2 items-center right-0 w-full h-full xl:w-96 2xl:w-96 lg:w-96 xs:w-full sm:w-full text-black bg-white transform ${
              isOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out`}
          >
            <ul className="text-2xl w-full justify-center items-center flex flex-col py-6">
              <li onClick={GotoProfile} className="mb-4 bg-white cursor-pointer text-center flex hover:text-blue-400 gap-2">
                <CgProfile size={30} /> Profile
              </li>
              <li id="AddCourse" onClick={AddCourse} className="mb-4 cursor-pointer bg-white text-center flex gap-2 py-3 hover:text-orange-300">
                <MdOutlineAddBox size={30} /> Add Course
              </li>
              <li id="BecomeProfessor" onClick={GoToBecProfessor} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2 py-3 hover:text-blue-300">
                <FaChalkboardTeacher size={30} /> Become Professor
              </li>
              <li id="Purchases" onClick={GotoPurchases} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2 py-3 hover:text-red-600">
                <MdOutlinePayments size={30} /> Purchases
              </li>
              <li id="Messages" onClick={GoToChat} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2 py-3 hover:text-blue-300">
                <LuMessagesSquare size={30} /> Messages
              </li>
              <li onClick={Logout} className="mb-4 flex text-rose-600 cursor-pointer gap-2 text-center py-3">
                <IoIosLogOut size={30} /> Logout
              </li>
            </ul>
          </div>

          {isOpen && (
            <div
              onClick={() => {
                setIsOpen(false);
                ChangeisOpentxt("Menu");
              }}
              className="fixed z-10 top-14 inset-0 bg-black opacity-35"
            ></div>
          )}
        </div>

        <h2 className="mt-32 text-3xl">
          Hi <strong>{Details.FullName} 👋🏻</strong>
        </h2>
       
       
        <div className="mt-6 mb-6 flex gap-3 text-xl">
          <button id="Enrolled" onClick={ChangeCardsArr} className="hover:border hover:bg-black py-2 hover:text-white px-3 rounded-lg">
            Enrolled
          </button>
          <button id="Courses" onClick={ChangeCardsArr} className="hover:border hover:bg-black py-2 hover:text-white px-3 rounded-lg">
            Courses
          </button>
        </div>

        <div className="mb-6 border  items-center justify-center h-16 shadow-lg text-lg rounded-lg w-80 flex gap-3 text-xl">
        <Search />
          <input
            type="text"
            placeholder="Search courses..."
            className=" h-full outline-none"
            value={QueryinCard}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              ChangeQueryinCard(query);
              const filteredCards = carddata.filter((card) =>
                card.Name.toLowerCase().includes(query)
              );
              ChangeCards(filteredCards);
            }}
          />
        </div>

        <div className='flex flex-wrap gap-6 justify-center'>
          {Cards.map((data) => (
            <Card key={data.Name} data={data} />
          ))}
        </div>
      </div>
    );
}
export default page 