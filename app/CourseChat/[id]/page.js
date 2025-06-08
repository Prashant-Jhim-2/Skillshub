import Clientside from './client'


export default async function Page({params}) {
const {id} = params
const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CommunityChats`)
const Response = await Request.json()

const Data = Response.Data


// Function to Get the Course Data
const Req = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetCourse/${id}`)
const Res = await Req.json()
const CourseData = Res.data

const NewFilter = Data.map((data)=>{
  if (data.Courseid == id ){
    return data
  }
})


// function to Get Enrolled Students 
const EnrolledStudent = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolledStudents/${id}`)
const EnrolledResponse = await EnrolledStudent.json()
 
  return (
    <>
      <Clientside Enrolled = {EnrolledResponse.data} CourseData={CourseData} data = {NewFilter}  />
     
    </> 
  );
}

