import {create} from 'zustand'


const useStore = create((set)=>({
    sharedState : '',
    setSharedState:(value)=>set({sharedState:value})
}))

export default useStore