import Clientside from "./clientside";

const page = async ({params}) => {
    const {id} = await params;
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/FetchQuiz/${id}`)
    const data = await Request.json()
    const Data = data.data
    console.log(Data)
    return(
        <Clientside data={Data}/>
    )
}
export default page;