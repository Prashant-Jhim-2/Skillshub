import Clientside from './ClientSide'
import { getServerSession } from 'next-auth';


export default async function Home() {
  const session = await getServerSession(authoptions);
  console.log(session)

  // Fetch data server-side
  const res = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Courses`, { cache: 'no-store' });
  const serverData = await res.json();
  

  return (
    <>
     
      <Clientside carddata={serverData.data} />
    </>
  );
}
