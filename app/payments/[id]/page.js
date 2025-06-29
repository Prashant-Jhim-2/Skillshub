import Clientside from './ClientSide'


export default async function Home({params}) {
  const {id} = params
 
  // Part To Get Payment Details 
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Payment/${id}`)
  const Response = await Request.json()
  const Payments = Response.data[0]
     const CourseID = Payments.CourseID
     const RequestforCourse = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Card/${CourseID}`)
     const ResponseforCourse = await RequestforCourse.json()
     const Course = ResponseforCourse.data
     console.log(Course)
    var Details = {
      Payments,
      Course
     }
  return (
    <>
     
      <Clientside Details ={Details}  />
    </>
  );
}
