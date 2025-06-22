'use client' 
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { CiSquarePlus } from "react-icons/ci";
import { LuSaveAll } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { MdUploadFile } from "react-icons/md";

import { getSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { BsBookHalf } from "react-icons/bs";


const Page = ()=>{
    const [Preview,ChangePreview] = useState(false);
    const [Drafts,ChangeDrafts] = useState([]);
    const [IsSaving,ChangeIsSaving] = useState(false);
    const [LoadingContext,ChangeLoadingContext] = useState('Loading');
    const [QuizName,ChangeQuizName] = useState("");
    const [DueDate,ChangeDueDate] = useState("");
    const [DueTime,ChangeDueTime] = useState("");
    const [TimeLimit,ChangeTimeLimit] = useState("");
    const [Authorized,ChangeAuthorized] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const [Questions,ChangeQuestions] = useState([]);
    const [Marks,ChangeMarks] = useState(0);
    const [Course,ChangeCourseDetails] = useState({id:undefined,Name:undefined});
    const [Courses,ChangeCourse] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDraftsModal, setShowDraftsModal] = useState(false);

    // Function To Clear All Question 
    const ClearQuestion = ()=>{
        ChangeQuestions([])
        ChangeQuizName("")
        ChangeDueDate("")
        ChangeDueTime("")
        ChangeTimeLimit("")
        ChangeMarks(0)
    }

    // Function to Delete Draft 
    const DeleteDraft = async(id)=>{
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteDraft/${id}`);
        const Response = await Request.json();
        if (Response.status === true){
            alert("Draft Deleted Successfully")
            FetchDrafts()
        }
    }

    // Function to Post Quiz 
    const PostQuiz = async(status)=>{
     
        const session = await getSession();
        const user = session.user;  
        const id = user.id;
        
        
       const Quiz = {
        status:status,
        ProfessorID:id ,
        CourseName:Course.Name,
        CourseID:Course.id,
        Name:QuizName,
        DueDate:DueDate,
        DueTime:DueTime,
        TimeLimit:TimeLimit,
        Questions:Questions,
        Marks:parseInt(Marks),
       }
       console.log(Quiz)
       
 
       if (QuizName === "" || DueDate === "" || DueTime === "" || TimeLimit === "" || Questions.length === 0 || Marks === 0 || Course.id === undefined || Course.id === 'Choose Course') {
        alert("Please fill all the fields")
        return;
       }
       else {
        setLoading(true)
        ChangeLoadingContext("Saving Quiz...")

        if (status === false){
            ChangeIsSaving(true)
        }
        if (status === true){
            ChangeIsSaving(false)
        }
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/PostQuiz`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(Quiz)
        })
        const Response = await Request.json();
        if (Response.status == true){
           setTimeout(()=>{
            setLoading(false)
            ChangeLoadingContext("Loading")
            
            ChangeQuestions([])
            ChangeMarks(0)
            if (status === false){
                FetchDrafts()
                alert("Quiz Saved Successfully")
            }
            if (status === true){
                alert("Quiz Posted Successfully")
            }
           },4000)
           
        }

       }
    }
   
    // Function to Fetch No of Course Which Professor is Teaching  
    const FetchCourse = async()=>{
        try {
            const session = await getSession();
            console.log(session);
            
            if (session && session.user) {
                console.log("Session Found");
                const user = session.user;
                console.log(user);
                const id = user.id;
                
                const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`);
                const Response = await Request.json();
                console.log(Response);
                
                if (Response.status === true) {
                    ChangeAuthorized(true);
                    const Req = await fetch(`${process.env.NEXT_PUBLIC_PORT}/FetchCourse/${id}`);
                    const Res = await Req.json();
                    if (Res.status === true) {
                        ChangeCourse(Res.data);
                        console.log(Res.data);
                    } else {
                        console.error("Failed to fetch courses:", Res);
                    }
                } else {
                    ChangeAuthorized(false);
                }
            } else {
                console.log("No session found");
                ChangeAuthorized(false);
            }
        } catch (error) {
            console.error("Error in FetchCourse:", error);
            ChangeAuthorized(false);
        } finally {
            setLoading(false);
        }
    }
     // Function to Fetch Drafts 
     const FetchDrafts = async()=>{
        const session = await getSession();
        if (session && session.user) {
            const user = session.user;
            const id = user.id;
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/FetchDrafts/${id}`);
            const Response = await Request.json();
            if (Response.status === true){
                ChangeDrafts(Response.data)
                console.log(Response)
        }
    }
}

    // Function to Load Draft Quiz Data
    const LoadDraftQuiz = (draftData) => {
        // Show loading state briefly
        setLoading(true);
        ChangeLoadingContext("Loading Draft...");
        
        setTimeout(() => {
            // Load all the quiz data from draft
            ChangeQuizName(draftData.Name || "");
            ChangeDueDate(draftData.DueDate || "");
            ChangeDueTime(draftData.DueTime || "");
            ChangeTimeLimit(draftData.TimeLimit || "");
            ChangeQuestions(draftData.Questions || []);
            ChangeMarks(draftData.Marks || 0);
            
            // Set course details
            if (draftData.CourseID && draftData.CourseName) {
                ChangeCourseDetails({
                    id: draftData.CourseID,
                    Name: draftData.CourseName
                });
            }
            
            // Close the modal
            setShowDraftsModal(false);
            
            // Hide loading and show success message
            setLoading(false);
            ChangeLoadingContext("Loading");
            alert("Draft loaded successfully! You can now continue editing your quiz.");
        }, 1000);
    }

    useEffect(()=>{
        console.log("Fetching Course");
        setLoading(true); // Set loading to true when starting
        FetchCourse();
        FetchDrafts()
    },[])

   

    // Question Card for editor 
    const QuestionCard = (props)=>{
        const data = props.data;

        // Function to Delete Question 
        const DeleteQuestion = (id)=>{
            const newQuestions = Questions.filter((question) => question.id !== id);
            ChangeQuestions(newQuestions);
            // Recalculate total marks
            const newMarks = newQuestions.reduce((total, question) => total + parseInt(question.Marks), 0);
            ChangeMarks(newMarks);
        }

        if (data.QuestionType === "Text" && Preview == false) {
            return (
                <div  className='flex relative w-full bg-white shadow-2xl rounded-xl mt-6 px-6 py-8 flex-col border items-start justify-center'>
                    <div className='flex items-center gap-2 mb-4 w-full'>
                    
                    <h1 className='text-sm font-bold '>Question {props.index + 1}</h1>
                    <h1 className='text-sm bg-blue-100 ml-6 text-blue-800 px-2 py-1 rounded'>{data.QuestionType}</h1>
                    <div className='flex text-xs text-green-800 bg-green-100 rounded-md  px-2 py-1 items-center justify-center gap-1 '>
                        <label>{data.Marks}</label>
                        <label className='text-sm'>Marks</label>
                    </div>
                    </div>
                    <pre className='text-sm mb-4 mt-4 break-words overflow-wrap-anywhere whitespace-pre-wrap font-sans w-full'>{data.Question}</pre>
                    <textarea className='border-2 outline-black mt-12 w-full text-base border-black rounded-md p-3 mb-4 h-36 resize-none' placeholder='Enter Question' />
                    <button onClick={() => DeleteQuestion(data.id)} className = 'absolute active:scale-75 transition-all duration-300 top-2 right-2 text-white bg-rose-600 p-2 rounded-md'><RiDeleteBinLine size ={20}/></button>
                   
                </div>
            )
        }
        if (data.QuestionType === "File Upload" && Preview == false) {
            return (
                <div className='flex relative w-full bg-white shadow-2xl rounded-xl mt-6 px-6 py-8 flex-col border items-start justify-center'>
                    <div className='flex gap-2 items-center mb-4 w-full'>
                    <h1 className='text-sm font-bold '>Question {props.index + 1}</h1>
                    <h1 className='text-sm bg-blue-100 ml-6 text-blue-800 px-2 py-1 rounded'>{data.QuestionType}</h1>
                    <h1 className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded'>{data.Marks} Marks</h1>
                    </div>
                    <pre className='text-sm mb-4 mt-4 break-words overflow-wrap-anywhere whitespace-pre-wrap font-sans w-full'>{data.Question}</pre>
                    <button className='mt-6 self-center flex items-center font-bold bg-white/80 justify-center gap-2 p-3 sm:p-4 w-full max-w-sm sm:max-w-md text-lg sm:text-xl border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-gray-600 hover:text-blue-600'>Upload a File</button>
                    <button onClick={() => DeleteQuestion(data.id)}  className = 'absolute active:scale-75 transition-all duration-300 top-2 right-2 text-white bg-rose-600 p-2 rounded-md'><RiDeleteBinLine size ={20}/></button>
                </div>
            )
        }
        if (data.QuestionType === "MCQ" && Preview == false) {
            return (
                <div className='flex relative w-full bg-white shadow-2xl rounded-xl mt-6 px-6 py-8 flex-col border items-start justify-center'>
                    <div className='flex items-center justify-between mb-4 w-full'>
                        <h2 className='text-sm font-bold text-gray-800'>Question {props.index + 1}</h2>
                        <div className='flex ml-6 items-center gap-2'>
                            <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded'>{data.QuestionType}</span>
                            <span className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded'>{data.Marks} Marks</span>
                        </div>
                    </div>
                    
                    <pre className='text-sm mb-4 mt-4 break-words overflow-wrap-anywhere whitespace-pre-wrap font-sans w-full'>{data.Question}</pre>
                    
                    {data.QuestionType === "MCQ" && data.Options && data.Options.length > 0 && (
                        <div className='space-y-2 mb-4 w-full'>
                            <label className='text-sm font-medium text-gray-600'>Options:</label>
                            <div className='grid grid-cols-1 gap-2 w-full'>
                                {data.Options.map((option, index) => (
                                    <div key={option.id} className='flex items-center gap-2 p-2 border rounded w-full'>
                                        <span className='text-sm font-medium flex-shrink-0'>{index + 1}.</span>
                                        <span className='text-sm break-words overflow-wrap-anywhere flex-1'>{option.value}</span>
                                        {data.RightOption && data.RightOption.id === option.id && (
                                            <span className='text-xs bg-green-100 text-green-800 px-1 rounded flex-shrink-0'>✓ Correct</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {data.RightOption && (
                        <div className='flex items-center gap-2 w-full'>
                            <span className='text-sm font-medium text-gray-600 flex-shrink-0'>Correct Answer:</span>
                            <span className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded break-words overflow-wrap-anywhere flex-1'>
                                {data.RightOption.value}
                            </span>
                        </div>
                    )}
                     <button onClick={() => DeleteQuestion(data.id)}  className = 'absolute active:scale-75 transition-all duration-300 top-2 right-2 text-white bg-rose-600 p-2 rounded-md'><RiDeleteBinLine size ={20}/></button>
                </div>
            )
    }

    // Preview mode question cards (student view)
    if (data.QuestionType === "Text" && Preview == true) {
        return (
            <div  className='flex relative w-full bg-white shadow-2xl rounded-xl mt-6 px-6 py-8 flex-col border items-start justify-center'>
                <div className='flex  items-center gap-2 mb-4 w-full'>
                
                <h1 className='text-sm  font-bold '>Question {props.index + 1}</h1>
                <h1 className='text-sm bg-blue-100 ml-6 text-blue-800 px-2 py-1 rounded'>{data.QuestionType}</h1>
                <div className='flex text-xs text-green-800 bg-green-100 rounded-md  px-2 py-1 items-center justify-center gap-1 '>
                    <label>{data.Marks}</label>
                    <label className='text-sm'>Marks</label>
                </div>
                </div>
                <pre className='text-sm mb-4 mt-4 break-words overflow-wrap-anywhere whitespace-pre-wrap font-sans w-full'>{data.Question}</pre>
                <textarea className='border-2 outline-black mt-12 w-full text-base border-black rounded-md p-3 mb-4 h-36 resize-none' placeholder='Answer Area for Student' />
            </div>
        )
    }
    if (data.QuestionType === "File Upload"  && Preview == true) {
        return (
            <div className='flex relative w-full bg-white shadow-2xl rounded-xl mt-6 px-6 py-8 flex-col border items-start justify-center'>
                <div className='flex gap-2 items-center  mb-4 w-full'>
                <h1 className='text-sm font-bold '>Question {props.index + 1}</h1>
                <h1 className='text-sm bg-blue-100 ml-6 text-blue-800 px-2 py-1 rounded'>{data.QuestionType}</h1>
                <h1 className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded'>{data.Marks} Marks</h1>
                </div>
                <pre className='text-sm w-full mb-4 mt-4 break-words overflow-wrap-anywhere whitespace-pre-wrap font-sans'>{data.Question}</pre>
                <button className='mt-6 self-center flex items-center font-bold bg-white/80 justify-center gap-2 p-3 sm:p-4 w-full max-w-sm sm:max-w-md text-lg sm:text-xl border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-gray-600 hover:text-blue-600'>Upload a File</button>
               
            </div>
        )
    }
    if (data.QuestionType === "MCQ" && Preview == true) {
        return (
            <div className='flex relative w-full bg-white shadow-2xl rounded-xl mt-6 px-6 py-8 flex-col border items-start justify-center'>
                <div className='flex flex-wrap items-center justify-between mb-4 w-full'>
                    <h2 className='text-sm font-bold text-gray-800'>Question {props.index + 1}</h2>
                    <div className='flex ml-6 items-center gap-2'>
                        <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded'>{data.QuestionType}</span>
                        <span className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded'>{data.Marks} Marks</span>
                    </div>
                </div>
                
                <pre className='text-sm mb-4 mt-4 break-words overflow-wrap-anywhere whitespace-pre-wrap font-sans w-full'>{data.Question}</pre>
                
                {data.QuestionType === "MCQ" && data.Options && data.Options.length > 0 && (
                    <div className='space-y-2 mb-4 w-full'>
                        <label className='text-sm font-medium text-gray-600'>Options:</label>
                        <div className='grid grid-cols-1 gap-2 w-full'>
                            {data.Options.map((option, index) => (
                                <div key={option.id} className='flex items-center gap-2 p-2 border rounded w-full'>
                                    <input type="radio" name={`question-${props.index}`} className='text-blue-600 flex-shrink-0' />
                                    <span className='text-sm font-medium flex-shrink-0'>{index + 1}.</span>
                                    <span className='text-sm break-words overflow-wrap-anywhere flex-1'>{option.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {data.RightOption && (
                    <div className='flex items-center gap-2 mt-4 p-2 bg-green-50 border border-green-200 rounded w-full'>
                        <span className='text-sm font-medium text-green-700 flex-shrink-0'>Correct Answer:</span>
                        <span className='text-sm bg-green-100 text-green-800 px-2 py-1 rounded break-words overflow-wrap-anywhere flex-1'>
                            {data.RightOption.value}
                        </span>
                    </div>
                )}
            </div>
        )
    }
}


// Function to generate random ID
const generateRandomId = () => {
    // Method 1: Using timestamp + random numbers
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
   
};
    const PostQuestion = ()=>{
        const [questionType, setQuestionType] = useState("");
        const [options,setOptions] = useState([]);
        const [rightOption,setRightOption] = useState(null);

        // Function to Push Options 
        const PushOptions = ()=>{
            const inputElement = document.getElementById("OptionInput");
            const value = inputElement.value;
            if (value.trim() !== "") {
                const newoption = {
                    id: options.length,
                    value: value 
                }
                setOptions([...options, newoption]);
                inputElement.value = "";
            }
        }

        // Function to Delete Options 
        const DeleteOptions = (id)=>{
            const newoptions = options.filter((option) => option.id !== id);
            setOptions(newoptions);
        }

        const PostQuestion = ()=>{
            const questionText = document.getElementById("Question").value;
            const marks = parseInt(document.getElementById("Marks").value) || 1
            
            if (questionText.trim() === "") {
                alert("Please enter a question!");
                return;
            }
            
            if (questionType === "") {
                alert("Please select a question type!");
                return;
            }
            
            if (questionType === "MCQ" && (!rightOption || options.length === 0)) {
                alert("Please add options and select the right answer!");
                return;
            }
            var Ques = {}
            if (questionType === "Text" || questionType === "File Upload") {
                Ques = {
                    id: generateRandomId(),
                    Question: questionText,
                    Marks: marks || 0,
                    QuestionType: questionType
                }
            }
            if (questionType === "MCQ" ) {
                Ques = {
                    id: generateRandomId(),
                    Question: questionText,
                    Options: options,
                    RightOption: rightOption,
                    QuestionType: questionType,
                    Marks: marks || 0
                }
            }
            
            ChangeQuestions([...Questions, Ques]);
            ChangeMarks(Marks + parseInt(marks))
            console.log(Ques)
            
            // Reset form
            document.getElementById("Question").value = "";
            document.getElementById("Marks").value = "";
            setQuestionType("");
            setOptions([]);
            setRightOption(null);
        }

        return (
            <motion.div className='flex relative xs:w-full w-full lg:w-1/2 bg-white shadow-2xl rounded-xl md:w-3/4 sm:w-full mt-12 xs:w-full px-6 py-12 flex-col border items-center justify-center'>
                <h1 className='text-lg self-start font-bold mb-4'>New Question</h1>
                
                <div className='w-full mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Question Type:</label>
                    <select 
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                        className='w-full p-3 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                        <option value="">Select Question Type</option>
                        <option value="MCQ">MCQ</option>
                        <option value="Text">Text</option>
                        <option value="File Upload">File Upload</option>
                    </select>
                </div>
                
                <textarea id="Question" className='border-2 w-full text-base border-black rounded-md p-3 mb-4 h-36 resize-none' placeholder='Enter Question' />
                
                {questionType === "MCQ" && (
                    <>
                        {options.length > 0 && (
                            <>
                                <label className='self-start text-sm font-medium text-gray-700 mb-2'>Options:</label>
                                <div className='flex self-start flex-wrap gap-2 mb-4'>
                                    {options.map((data) => (
                                        <div key={data.id} className='flex items-center h-12 justify-center gap-2'>
                                            <label className='text-sm font-medium'>{data.id + 1}.</label>
                                            <label className='p-2 font-bold text-sm bg-green-600 text-white rounded'>
                                                {data.value}
                                            </label>
                                            <button 
                                                onClick={() => DeleteOptions(data.id)}
                                                className='p-1 hover:bg-red-50 rounded'
                                            >
                                                <RiDeleteBinLine size={20} className='text-red-600' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        <div className='flex gap-2 mt-6 items-center w-full'>
                            <input 
                                id="OptionInput" 
                                className='flex-1 border-2 p-2 border-black h-12 rounded focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                type='text' 
                                placeholder="Add Options"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        PushOptions();
                                    }
                                }}
                            />
                            <button 
                                onClick={PushOptions} 
                                className='bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors'
                            >
                                Add
                            </button>
                        </div>
                        
                        {options.length > 0 && (
                            <>
                            <label className='self-start mt-6 text-sm flex items-center justify-center gap-2 font-medium text-gray-700 mb-2'>
                                Right Option:
                                {rightOption != null && (
                                    <label className='text-sm font-bold text-white p-2 bg-green-600 rounded'>
                                        {rightOption.value}
                                    </label>
                                )}
                            </label>
                            <select 
                                value={rightOption ? rightOption.value : ""}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    const selectedOption = options.find(option => option.value === selectedValue);
                                    setRightOption(selectedOption);
                                }}
                                className='w-full p-3 mt-6 mb-6 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            >
                                <option value="">Choose Right Option</option>
                                {options.map((data) => (
                                    <option key={data.id} value={data.value}>
                                        {data.value}
                                    </option>
                                ))}
                            </select>
                            </>
                        )}
                    </>
                )}
                
                <button onClick={PostQuestion} className='self-start text-sm mt-6 flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-md hover:bg-gray-800 transition-colors'>
                    Post <FaRegArrowAltCircleUp size={20} />
                </button>
                
                <div className='flex absolute top-4 right-4 items-center justify-center gap-2'>
                    <input 
                        id="Marks"
                        min={0} 
                        className='border-2 w-16 outline-black text-sm border-black rounded-md p-2' 
                        type='number' 
                        placeholder="0"
                    />
                    <label className='text-sm'>Marks</label>
                </div>
               
            </motion.div>
        )
    }


     // Loading state - show until data is fetched
     if (loading) {
        return (
            <div 
            style={{
                backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            className="flex relative w-full min-h-screen flex-col items-center justify-center px-4">
                <h1 className="flex bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 absolute self-center font-bold text-lg top-4 z-30">
                    <label className="text-orange-600">EduCorner</label> 
                    <label className="text-blue-600">Tutoring</label> 
                    <span className="text-gray-600">/Quiz</span>
                </h1>
                <div className='flex p-12 rounded-xl shadow-2xl flex-col bg-white items-center justify-center gap-4'>
                    {LoadingContext == "Loading" ? <><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    <h1 className='text-lg'>Loading Quiz Creator...</h1>
                    <p className='text-sm text-gray-600'>Please wait while we fetch your courses</p></>:
                    LoadingContext == "Loading Draft..." ? <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <h1 className='text-lg'>Loading Draft...</h1>
                        <p className='text-sm text-gray-600'>Please wait while we load your draft quiz</p>
                    </> :
                    <>{IsSaving ? 
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            <h1 className='text-lg'>Saving Quiz...</h1>
                            <p className='text-sm text-gray-600'>Please wait while we save your quiz</p>
                        </> : <>
                        
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            <h1 className='text-lg'>Posting Quiz...</h1>
                            <p className='text-sm text-gray-600'>Please wait while we post your quiz</p>
                        </>
                    }</>
                 }
                    </div>
            </div>
        )
    }
   if (!loading){
     // Main editor view
     if (Authorized === true && Courses.length !== 0 && Preview === false){
        return (
            <div
            style={{
                backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            className="flex relative w-full min-h-screen flex-col items-center px-4">

                <button 
                    onClick={() => setShowDraftsModal(true)}
                    className = 'absolute top-4 right-4 flex items-center gap-1 rounded text-sm bg-white/80 text-black  border-2 border-black  shadow-2xl transition-all duration-300 hover:bg-gray-50 active:scale-125 rounded-md px-3 py-2'>
                    Drafts <LuSaveAll size={16} />
                </button>
                <h1 className="flex bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 absolute self-center font-bold text-lg top-20 z-30">
                    <label className="text-orange-600">EduCorner</label> 
                    <label className="text-blue-600">Tutoring</label> 
                    <span className="text-gray-600">/Quiz</span>
                </h1>
                
                <div className='flex bg-white relative flex-col border shadow-2xl mt-36 rounded-xl xs:w-full w-full lg:w-1/2 md:w-3/4 sm:w-full xs:w-full px-6 py-16 items-start justify-start '>
                    <label className='absolute bottom-2 right-2 font-bold p-2 bg-green-200 text-green-800 rounded-md text-sm'>{Marks} Marks</label>
                    <h1 className='text-lg sm:text-xl font-bold mb-4'>Create Quiz</h1> 
                    <button onClick={()=>PostQuiz(false)} className='absolute transition-colors duration-300 flex items-center gap-1 top-2 left-2  rounded active:bg-white active:border-2 active:border-black active:text-black  text-sm bg-green-500 text-white px-3 py-2'>Save <LuSaveAll size={16} /></button>
                    <input 
                        id = 'QuizName'
                        value={QuizName}
                        onChange={(e)=>{
                            ChangeQuizName(e.target.value)
                        }}
                        className='w-full p-6 border-2 rounded-md border-black resize-none' 
                        placeholder='Enter Quiz Name' 
                    />
                    <select 
                        value={Course.id && Course.Name ? `${Course.id}:SubjectName:${Course.Name}` : "Choose Course"}
                        onChange={(e)=>{
                       
                        const split = e.target.value.split(":SubjectName:")
                        const id = split[0] 
                        const SubjectName = split[1]
                        console.log({id:id,Name:SubjectName})
                        ChangeCourseDetails({id:id,Name:SubjectName})
                    }} className='absolute top-2 right-2 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-md rounded-md px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 hover:bg-gray-50 transition-colors'>
                        <option>Choose Course</option>
                       {Courses.map((data)=><option Name = {data.Name} key={data.id} value={data.id+ ":SubjectName:"+data.Name}>{data.Name}</option>)}
                    </select>

                    {/* Drafts Modal */}
                    {showDraftsModal && (
                        <div className = 'inset-0 flex flex-col items-center justify-center w-screen h-screen fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-40 backdrop-blur-sm'>
                            <div className = 'flex w-3/4 relative flex-col bg-white rounded-md h-[80vh] overflow-hidden'>
                                {/* Sticky Header */}
                                <div className='flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10'>
                                    <label className='text-xl font-bold'>Drafts</label>
                                    <button 
                                        onClick={() => setShowDraftsModal(false)}
                                        className='px-3 py-2 rounded-lg border-2 border-black text-sm hover:bg-gray-100 transition-colors'>
                                        Close
                                    </button>
                                </div>
                                
                                {/* Scrollable Content */}
                                <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                                    {Drafts.length != 0 ? <>{Drafts.map((data)=>{
                                        return (
                                            <div key={data.id} className='flex border-2 w-full border-black rounded-md p-2 flex-col items-center justify-center gap-2'>
                                            <label className='text-md font-bold'>{data.Name}</label>
                                            <label className='text-xs mb-3'>Subject : {data.CourseName}</label>
                                           <div className='flex items-center justify-center gap-2'>

                                           <button 
                                                onClick={() => LoadDraftQuiz(data)}
                                                className='bg-black flex items-center gap-2 justify-center transition-colors duration-300 active:bg-white border shadow-2xl border-black active:text-black text-white px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-1 sm:gap-2 rounded-md transition-all duration-300 text-sm sm:text-base'>
                                                Open Draft <BsBookHalf size={16} />
                                            </button>
                                            <button
                                            onClick = {()=>DeleteDraft(data.id)}
                                            className = 'bg-red-600 active:bg-white active:text-rose-600 active:border-2 active:border-black transition-all duration-100 text-white px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-1 sm:gap-2 rounded-md  text-sm sm:text-base'>Delete</button>
                                           </div>
                                        </div>
                                        )
                                    })}</>:<>
                                    <div className='flex flex-col mt-36 items-center justify-center gap-2'>
                                        <Image src = '/empty.gif' alt = 'No Drafts Found' width={100} height={100} />
                                        <label className='text-lg  font-bold'>No Drafts Found</label>
                                       </div>
                                    </>}

                                   

                                   
                                   

                                </div>
                            </div>
                        </div>
                    )}

                    <div className='flex mt-3 flex-wrap items-center gap-2'>
                        <label>Due Date</label>
                        <input
                        id = 'DueDate'
                        value={DueDate}
                        onChange={(e)=>{
                            console.log(e.target.value)
                            ChangeDueDate(e.target.value)
                        }} type="date" className='border-2 border-black rounded-md p-2' />
                        <input
                        id = 'DueTime'
                        value={DueTime}
                        onChange={(e)=>{
                            console.log(e.target.value)
                            ChangeDueTime(e.target.value)
                        }} type="time" placeholder='00:00' className='border-2 border-black rounded-md p-2' />
                    </div>

                    <div className='flex mt-6 items-center gap-2'>
                        <label>Time Limit</label>
                        <input 
                        id = 'TimeLimit'
                        value={TimeLimit}
                        onChange = {(e)=>{
                          
                            ChangeTimeLimit(e.target.value)
                        }}
                        min={1} type = 'number' className='border-2 border-black w-16 rounded-md p-2' />
                        <label>Minutes</label>
                    </div>
                    <div className='flex mt-6 gap-2 w-full'>
                        <button onClick={()=>PostQuiz(true)} className='flex-1 bg-black text-white px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-1 sm:gap-2 rounded-md transition-all duration-300 text-sm sm:text-base'>
                        Post <MdUploadFile size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={ClearQuestion} className='flex-1 bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-1 sm:gap-2 rounded-md transition-all duration-300 text-sm sm:text-base'>
                            Clear <RiDeleteBinLine size={16} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    <button onClick={()=>ChangePreview(true)} className='absolute bg-black text-white px-4 py-2 rounded-lg text-sm bottom-2 left-2 flex items-center gap-2 hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium'>
                        <IoEyeOutline size={18} />
                        Preview Quiz
                    </button>
                </div>


                
                
                {!isOpen ?  
                    <button 
                        onClick={() => setIsOpen(true)}
                        className='mt-6 flex items-center font-bold bg-white/80 justify-center gap-2 p-3 sm:p-4 w-full max-w-sm sm:max-w-md text-lg sm:text-xl border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-gray-600'
                    >
                        New Question <CiSquarePlus size={32} className="sm:w-10 sm:h-10" />
                    </button>
                    :
                    <>
                        {Questions.length > 0 && (
                            <div className='w-full max-w-4xl mx-auto mt-12 flex flex-col gap-6 items-center justify-center'>
                                <h2 className='text-lg sm:text-xl p-2 bg-white rounded-md font-bold text-gray-800 shadow-sm'>Posted Questions ({Questions.length})</h2>
                                <div className='w-full space-y-4'>
                                    {Questions.map((data,index) => (
                                        <QuestionCard index={index} key={data.id} data={data} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <PostQuestion/>
                    </>
                }
            </div>
        )
    }

    // Preview mode
    if (Authorized === true && Courses.length !== 0 && Preview === true){
        return (
            <div 
            style={{
                backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            className="flex relative w-full min-h-screen flex-col items-center px-4">
                <h1 className="flex bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 absolute self-center font-bold text-lg top-4 z-30">
                    <label className="text-orange-600">EduCorner</label> 
                    <label className="text-blue-600">Tutoring</label> 
                    <span className="text-gray-600">/Quiz</span>
                </h1>

                <div className='flex bg-white relative flex-col border shadow-2xl mt-24 rounded-xl xs:w-full w-full lg:w-1/2 md:w-3/4 sm:w-full xs:w-full px-6 py-16 items-start justify-start '>
                    
                    <h1 className='text-lg mt-6 font-bold'>Quiz Preview</h1>
                    <button
                    onClick={()=>ChangePreview(false)}
                    className='bg-gray-700 text-white px-4 py-2 rounded-lg text-sm top-2 right-2 absolute top-2 right-2 flex items-center gap-2 hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium'
                    >
                        <IoClose size={18} />
                        Close Preview
                    </button>

                    <div className='flex w-full flex-col gap-4 mt-6'>
                        {Questions.map((data,index)=>{
                            return (
                                <QuestionCard index={index} key={data.id} data={data} />
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Not authorized
    if (Authorized === false){
        return (
            <div
            style={{
                backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            className='flex flex-col items-center justify-center h-screen'>
                 <h1 className="flex bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 absolute self-center font-bold text-lg top-4 z-30">
                        <label className="text-orange-600">EduCorner</label> 
                        <label className="text-blue-600">Tutoring</label> 
                        <span className="text-gray-600">/Quiz</span>
                    </h1>
               <div className='flex  p-12 rounded-xl shadow-2xl  flex-col  bg-white items-center justify-center gap-4'>
               <Image src="/empty.gif" alt="Logo" width={100} height={100} />
               <h1 className='text-lg '>You are not authorized to access this page</h1>
               <Link href = '/home'>
              <button className='bg-black text-white px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-1 sm:gap-2 rounded-md mt-3 active:scale-95 active:bg-gray-800 transition-all duration-300 text-sm sm:text-base'>Back To Home</button>
              </Link>
               </div>
                
            </div>
        )
    }

    // No courses
    if (Authorized === true && Courses.length === 0){
        return (
            <div
            style={{
                backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            className='flex flex-col items-center justify-center h-screen'>
                 <h1 className="flex bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 absolute self-center font-bold text-lg top-4 z-30">
                        <label className="text-orange-600">EduCorner</label> 
                        <label className="text-blue-600">Tutoring</label> 
                        <span className="text-gray-600">/Quiz</span>
                    </h1>
               <div className='flex  p-12 rounded-xl shadow-2xl  flex-col  bg-white items-center justify-center gap-4'>
               <Image src="/empty.gif" alt="Logo" width={100} height={100} />
               <h1 className='text-lg '>You do not have any course to create quiz</h1>
              <Link href = '/home'>
              <button className='bg-black text-white px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-1 sm:gap-2 rounded-md mt-3 active:bg-gray-800  active:scale-95 transition-all duration-300 text-sm sm:text-base'>Back To Home</button>
              </Link>
               </div>
                
            </div>
        )
    }
   }
}

export default Page;