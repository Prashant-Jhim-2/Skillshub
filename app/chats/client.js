'use client'

const Page = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-lg mt-2">Educorner 📖</h1>
      <label className="text-xs bg-black text-white p-2 rounded">Community Chat</label>
      <button className="fixed top-2 left-2">Back</button>

      

      <div className="mt-24 w-80 flex flex-col items-center justify-center">
        <label>All Chats</label>

        <div className="flex flex-col mt-12 gap-6 items-center justify-center w-full">

             <div className="w-80 flex shadow-lg rounded flex-col gap-4 border p-3">
                <h1 className="text-xl font-bold">Ilets Course</h1>
                <p className="text-[10px]">Last Message : <strong className="bg-red-500 text-white p-2 rounded">Me : Prashant</strong> </p>
                <button className="self-start text-xs bg-black text-white p-2 rounded">Go to Chat 💬</button>
            </div>

             <div className="w-80 flex shadow-lg rounded flex-col gap-4 border p-3">
                <h1 className="text-xl font-bold">Ilets Course</h1>
                <p className="text-[10px]">Last Message : <strong className="bg-red-500 text-white p-2 rounded">Me : Prashant</strong> </p>
                <button className="self-start text-xs bg-black text-white p-2 rounded">Go to Chat 💬</button>
            </div>

        </div>
      </div>
    </div>
  );
}
export default Page;