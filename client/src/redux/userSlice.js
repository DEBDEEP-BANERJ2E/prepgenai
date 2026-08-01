import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name:"user",
    initialState:{
        userData:null
    },
    reducers:{
        setUserData:(state,action)=>{
            state.userData = action.payload

        },
        updateCredits : (state, actions) => {
            if(state.userData){
                state.userData.credits = actions.payload
            }
        }
    },


})

export const {setUserData , updateCredits} = userSlice.actions

export default userSlice.reducer