'use client'
import {useState} from 'react'
import { getSession ,signOut} from 'next-auth/react';
import Head from 'next/head'
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import Footer from '../footer'
import { IoIosLogOut } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineAddBox } from "react-icons/md";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { TiThMenuOutline } from "react-icons/ti";
import { FaRegWindowClose } from "react-icons/fa";
import { useEffect } from "react"
import { FaChalkboardTeacher } from "react-icons/fa";


const page = ({carddata}) =>{
    const Router = useRouter()
    
    const [isOpentxt,ChangeisOpentxt] = useState("Menu")
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

   
    // Parital Search Function 
    const AdvanceSearch = (arr,query) =>{
        return arr.filter((data)=>data.Name.toLowerCase().startsWith(query.toLowerCase()))
    }
   // Function To Search in Database about that query
   const Search = () =>{
    const Query = document.getElementById("Search").value
    ChangeQueryinCard(Query) 
    if (Query != ""){
        const NewData = AdvanceSearch(Cards,Query)
        if (NewData.length != 0){
            ChangeCards(NewData)
        }
    }
    if (Query == ""){
        CheckAuth()
    }
    
   }

   // Function To Get Enrolled Courses 
   const GetEnrolled = async() =>{
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolled/${Details.id}`)
    const Response = await Request.json()
      ChangeEmpty(Response.status)
      ChangeCards(Response.data)
    
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
    // View Component 
    const View = () =>{
        if (Cards.length != 0){
          
            return (
                <div  className = 'flex flex-wrap gap-12 justify-center items-center'>
                {Cards.map((data)=><Card Description={data.Description} Duration={data.Duration} Field={data.Field} format={data.Format} ImgSrc={data.ImgSrc} Level={data.Level} Name={data.Name} Price={data.Price} ProfessorId={data.ProfessorId} topics={data.Topics} id = {data.id}/>)}
                </div>
            )
        }
        if (Cards.length == 0){
          const Check = () =>{
            console.log(Empty)
            if (Empty == false){
              return (
                <>
 <div className = 'flex animate-jump flex-col mt-12 items-center text-2xl'>
            Loading.....
            <div className="flex items-center justify-center h-24">
              <div className="relative w-80 max-w-md h-12 bg-gray-300 rounded-full overflow-hidden">
  
               <div className="absolute w-80 h-12 bg-blue-500 rounded-full animate-slide"></div>
            </div>
            </div>
            </div>                </>
              )
            }
            if (Empty == true){
              return (
                <>
                <h1 className = 'mt-12'>No Enrolled Courses 📝 </h1>
                <button onClick = {CheckAuth} className = 'active:border-black active:border  active:bg-white active:text-black mt-12 px-3 py-2 rounded bg-black text-white'>Go to Courses Page</button>
                </>
              )
            }
          }
           return (
            <>
            <Check/>


            </>
           )
        }
    }
    // Card Component 
    const Card = (props)=>{
        const id = props.id
        const format = props.format
        const topics = props.topics
        
        const GoToCoursePage = () =>{
          Router.push("/courses/" + id )
        }

        const highlightMatch = (text, query) => {
            if (!query) return text;
        
            const regex = new RegExp(`(${query})`, "gi"); // Create regex to match the query (case-insensitive)
            const parts = text.split(regex);
        
            return parts.map((part, index) =>
              regex.test(part) ? (
                <span key={index} className="bg-yellow-200 font-bold">
                  {part}
                </span>
              ) : (
                part
              )
            );
          };


        // Function To Check Whether User is Professor
        const ProfessorOrNot = () =>{
          const ProfessoriD = props.ProfessorId 
          const UserId =  Details.id 
          if (ProfessoriD == UserId){
            return (
              <>
              <button onClick = {GoToCoursePage} className="bg-red-500 mt-3 font-bold text-lg shadow-md hover:shadow-lg hover:bg-green-600 transition duration-200 ease-in-out hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                 Edit 📝
                </button>
              </>
            )
          }
          else{
            return(
              <button onClick = {GoToCoursePage} className="bg-red-500 mt-3 font-bold text-lg shadow-md hover:shadow-lg hover:bg-green-600 transition duration-200 ease-in-out hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                 Enroll Now
                </button>
            )
          }
        }
        return (
            <div id = {id}  className = 'flex w-96  hover:border-2 hover:shadow-none mb-12  transition duration-200 hover:translate-y-2 rounded-lg border-1  gap-2  border border-gray-300 flex-col '>
                <div className = 'w-full   border-b  h-48 relative'>
                <Image className = 'z-2' alt = 'Course Img' layout =  'fill' objectFit='cover' src = {props.ImgSrc} />
                </div>
                <div className = 'p-6 flex flex-col gap-2'>
                <h1 className =' text-2xl'>{highlightMatch(props.Name,QueryinCard)}</h1>
                <h1 className = 'text-xl'>Field : {props.Field}</h1>
                <p className = 'text-sm'><strong>Course Duration :</strong> {props.Duration} Weeks</p>
                <p className = 'text-sm'><strong>Course Level :</strong> {props.Level}</p>
                <p className = 'text-sm'><strong>Course Format :</strong> 
                {format.map((data)=><>{data.Name}   </>)}
                </p>
                <p className = 'text-sm'><strong>Technologies Covered :</strong>
                {topics.map((data)=><>{data.Name}  </>)}
                </p>
                <p className = 'text-sm'>Price : ${props.Price} (Canadian Dollars) </p>
               <ProfessorOrNot/>
            
            
                </div>
                </div>
        )
    }

    const GoToBecProfessor = ()=>{
      Router.push("/BecomeProfessor")
    }
    return (
        <div className = "flex  relative flex-col items-center">
        <title>SkillsHub📝</title> 
           <div className = 'fixed z-20 shadow-sm bg-white p-4   flex w-full'>
            <h1 className = "text-2xl ">SkillsHub📝</h1>
            <button onClick={OpenOrClose} className = 'fixed flex gap-3 z-12 top-2 p-3 text-lg right-2'>{MenuBtn}</button>
           </div>

           <div className="relative">
      
      

      
      <div
        className={`fixed z-20 top-[60px] border-0 border-t  flex flex-col gap-2 items-center  right-0 w-full  h-full xl:w-96 2xl:w-96 lg:w-96 xs:w-full sm:w-full text-black bg-white  transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <ul className = 'text-2xl w-full justfiy-center items-center flex flex-col py-6' >
          <li onClick = {GotoProfile} className="mb-4 bg-white cursor-pointer  text-center flex hover:text-blue-400 gap-2 "><MdOutlineSpaceDashboard size={30} /> Dashboard</li>
          <li id = "AddCourse" onClick={AddCourse} className="mb-4 cursor-pointer bg-white  text-center flex gap-2  py-3  hover:text-orange-300"> <MdOutlineAddBox size={30} /> Add Course</li>
          <li id = 'BecomeProfessor' onClick={GoToBecProfessor} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2  py-3  hover:text-blue-300"><FaChalkboardTeacher size = {30} />  Become Professor</li>
          <li onClick = {Logout} className="mb-4 flex   text-rose-600 cursor-pointer gap-2  text-center py-3  "> <IoIosLogOut size={30} /> Logout  </li>
        </ul>
      </div>

     
      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false)
            ChangeisOpentxt("Menu")
        }}
          className="fixed z-10 top-14 inset-0 bg-black opacity-35"
        ></div>
      )}
    </div>
        
        
           <h2 className = 'mt-32 text-3xl'>Hi <strong>{Details.FullName} 👋🏻 </strong> </h2>
        <div className = 'flex w-80 mt-6 rounded-lg hover:ring-2 ring-black gap-2 items-center justify-content border  px-2 '>
        <IoIosSearch size = {30} />
        <input onChange={Search} id = "Search" className = 'w-80 h-12 outline-none' type = 'text' placeholder = 'Search Courses' />
        </div>
           <div className = 'mt-6 mb-6 flex gap-3 text-xl'>
            <button id = "Enrolled" onClick={ChangeCardsArr} className = 'hover:border hover:bg-black py-2 hover:text-white px-3 rounded-lg'>Enrolled</button>
            <button id = "Courses" onClick={ChangeCardsArr} className = 'hover:border hover:bg-black py-2 hover:text-white px-3 rounded-lg'>Courses</button>
           </div>
           
           
          <View/>
         
           <Footer/>

        </div>
    )
}
export default page 