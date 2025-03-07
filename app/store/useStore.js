import {create} from 'zustand'

export const useArrStore = create((set)=>({
    Users : [],
    ChangeUsers:(newArr)=> set({Users:newArr})
}))

export const useRefundStore = create((set)=>({
    Refunds : [],
    ChangeRefunds:(NewArr)=> set({Refunds:NewArr})
}))