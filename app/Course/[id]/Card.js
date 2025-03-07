import Image from "next/image";
import { useRouter } from "next/navigation";
import { CiPlay1 } from "react-icons/ci";

const Card = ({id, urlofThumbnail, Name, Description }) => {
  const Router = useRouter()
  // Function to go to Video Page 
  const Play = () =>{
    Router.push('/Video/'+ id )
  }
  return (
    <div className="flex h-full relative w-full max-w-md flex-col overflow-hidden mb-6 border shadow-lg">
    
        <Image
          src={urlofThumbnail}
          layout="responsive" 
          width={800} // Aspect ratio width
          height={600}
          alt={Name || "Thumbnail"}
        />
     
      <div className="p-4">
        <button
          aria-label="Counter Button"
          className="absolute top-2 right-2 bg-blue-300 text-xl w-12 rounded-full h-12"
        >
          1
        </button>
        <h3 className="text-xl font-semibold mb-2">{Name}</h3>
        <p className="text-gray-600 text-sm">{Description}</p>
        <button onClick = {Play} className="border border-black px-3 py-2 text-center mt-6 flex items-center justify-center gap-2 bg-black text-white rounded">
          Play <CiPlay1 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Card;
